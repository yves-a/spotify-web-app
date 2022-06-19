/* eslint-disable no-console */
const express = require('express')
const axios = require('axios')
const port = process.env.PORT || 5003
const path = require('path')
var access_token = ''

var spotify_redirect_uri =
  'https://spotify-web-app-yves.herokuapp.com/auth/callback'

if (process.env.NODE_ENV !== 'production') {
  const dotenv = require('dotenv')
  dotenv.config()
  spotify_redirect_uri = 'http://localhost:3000/auth/callback'
}

var userId
var songUris
var playlistID
var spotify_client_id = process.env.SPOTIFY_CLIENT_ID
var spotify_client_secret = process.env.SPOTIFY_CLIENT_SECRET

var generateRandomString = function (length) {
  var text = ''
  var possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }
  return text
}

var app = express()

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../build')))
}

app.get('/auth/health', (req, res) => {
  res.send('ok')
})

app.get('/auth/login', (req, res) => {
  var scope =
    'streaming user-read-email user-read-private user-top-read playlist-modify-public playlist-read-collaborative'
  var state = generateRandomString(16)

  var auth_query_parameters = new URLSearchParams({
    response_type: 'code',
    client_id: spotify_client_id,
    scope: scope,
    redirect_uri: spotify_redirect_uri,
    state: state,
  })

  res.redirect(
    'https://accounts.spotify.com/authorize/?' +
      auth_query_parameters.toString()
  )
})

app.get('/auth/callback', (req, res) => {
  var code = req.query.code
  const data = new URLSearchParams({
    code: code,
    redirect_uri: spotify_redirect_uri,
    grant_type: 'authorization_code',
  })
  const headers = {
    Authorization:
      'Basic ' +
      Buffer.from(spotify_client_id + ':' + spotify_client_secret).toString(
        'base64'
      ),
    'Content-Type': 'application/x-www-form-urlencoded',
  }
  axios
    .post('https://accounts.spotify.com/api/token', data, {
      headers: headers,
    })
    .then((response) => {
      if (response.status === 200) {
        access_token = response.data.access_token
        res.redirect('/')
      }
    })
    .catch((error) => console.log(error, 'callback'))
})

app.get('/auth/token', (req, res) => {
  res.json({ access_token: access_token })
})

app.get('/auth/tracks', (req, res) => {
  var top_query_parameters = new URLSearchParams({
    limit: 10,
    time_range: 'short_term',
  })
  const headers = {
    Authorization: 'Bearer ' + access_token,
  }
  // use the access token to access the Spotify Web API
  axios
    .get('https://api.spotify.com/v1/me/top/tracks?' + top_query_parameters, {
      headers: headers,
    })
    .then((response) => {
      if (response.status === 200) {
        const listOfSongUris = response.data.items.map((song) => song.uri)
        songUris = listOfSongUris.join()
        res.json({ body: response.data })
      }
    })
    .catch((error) => console.log(error, 'tracks'))
})

app.get('/auth/playlist', (req, res) => {
  const headers = { Authorization: 'Bearer ' + access_token }
  const data = {
    name: `Top Songs of this Month for ${userId} by Spotify Web App`,
    description: 'Made by Spotify Web App',
  }
  var song_paramters = new URLSearchParams({
    position: 0,
    uris: songUris,
  })
  // use the access token to access the Spotify Web API
  axios
    .post(`https://api.spotify.com/v1/users/${userId}/playlists`, data, {
      headers: headers,
    })
    .then((response) => {
      if (response.status === 201) {
        playlistID = response.data.id
        axios
          .post(
            `https://api.spotify.com/v1/playlists/${playlistID}/tracks?` +
              song_paramters,
            {},
            {
              headers: headers,
            }
          )
          .then((response) => {
            if (response.status === 201) {
              res.redirect('/')
            }
          })
          .catch((error) =>
            console.log(error.request.headers, 'add song playlist')
          )
      }
    })
    .catch((error) => console.log(error, 'create playlist'))
})

app.get('/auth/userPlaylists', (req, res) => {
  const headers = { Authorization: 'Bearer ' + access_token }
  axios
    .get('https://api.spotify.com/v1/me/playlists', {
      headers: headers,
    })
    .then((response) => {
      if (response.status === 200) {
        const playlists = response.data.items
        var madePlaylist = false
        if (playlistID) {
          playlists.forEach((playlist) => {
            if (playlist.id === playlistID) {
              madePlaylist = true
            }
          })
        }

        res.json({ body: response.data, madePlaylist })
      }
    })
    .catch((error) => console.log(error, 'find playlist'))
})

app.get('/auth/user', (req, res) => {
  const headers = { Authorization: 'Bearer ' + access_token }

  axios
    .get('https://api.spotify.com/v1/me', {
      headers: headers,
    })
    .then((response) => {
      if (response.status === 200) {
        userId = response.data.id
        res.json({ body: response.data })
      }
    })
    .catch((error) => console.log(error, 'user'))
})

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Listening at http://localhost:${port}`)
})
