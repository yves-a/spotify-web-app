const express = require('express')
const request = require('request')
const dotenv = require('dotenv')
const port = 5003

var access_token = ''

dotenv.config()
var userId
var songUris
var playlistID
var spotify_client_id = process.env.SPOTIFY_CLIENT_ID
var spotify_client_secret = process.env.SPOTIFY_CLIENT_SECRET

var spotify_redirect_uri = 'http://localhost:3000/auth/callback'

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

app.get('/health', (req, res) => {
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

  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    form: {
      code: code,
      redirect_uri: spotify_redirect_uri,
      grant_type: 'authorization_code',
    },
    headers: {
      Authorization:
        'Basic ' +
        Buffer.from(spotify_client_id + ':' + spotify_client_secret).toString(
          'base64'
        ),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    json: true,
  }

  request.post(authOptions, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      access_token = body.access_token
      res.redirect('/')
    }
  })
})

app.get('/auth/token', (req, res) => {
  res.json({ access_token: access_token })
})

app.get('/auth/tracks', (req, res) => {
  var top_query_parameters = new URLSearchParams({
    limit: 10,
    time_range: 'short_term',
  })

  var userOptions = {
    url: 'https://api.spotify.com/v1/me/top/tracks?' + top_query_parameters,
    headers: { Authorization: 'Bearer ' + access_token },
    json: true,
  }
  // use the access token to access the Spotify Web API
  request.get(userOptions, function (error, response, body) {
    const listOfSongUris = body.items.map((song) => song.uri)
    songUris = listOfSongUris.join()
    res.json({ body })
  })
})

app.get('/auth/playlist', (req, res) => {
  var playlistOptions = {
    url: `https://api.spotify.com/v1/users/${userId}/playlists`,
    body: {
      name: `Top Songs of this Month for ${userId} by Spotify Web App`,
      description: 'Made by Spotify Web App',
    },
    headers: { Authorization: 'Bearer ' + access_token },
    json: true,
  }

  var song_paramters = new URLSearchParams({
    position: 0,
    uris: songUris,
  })
  var songOptions = {
    url: `https://api.spotify.com/v1/playlists/${playlistID}/tracks`,
    headers: { Authorization: 'Bearer ' + access_token },
    json: true,
  }
  // use the access token to access the Spotify Web API
  request.post(playlistOptions, function (error, response, body) {
    if (!error && response.statusCode === 201) {
      playlistID = body.id
      songOptions.url =
        `https://api.spotify.com/v1/playlists/${playlistID}/tracks?` +
        song_paramters
      request.post(songOptions, function (error, response) {
        if (!error && response.statusCode === 201) {
          res.redirect('/')
        }
      })
    }
  })
})

app.get('/auth/userPlaylists', (req, res) => {
  var userOptions = {
    url: 'https://api.spotify.com/v1/me/playlists',
    headers: { Authorization: 'Bearer ' + access_token },
    json: true,
  }
  // use the access token to access the Spotify Web API
  request.get(userOptions, function (error, response, body) {
    const playlists = body.items
    var madePlaylist = false
    if (playlistID) {
      playlists.forEach((playlist) => {
        if (playlist.id === playlistID) {
          madePlaylist = true
        }
      })
    }

    res.json({ body, madePlaylist })
  })
})

app.get('/auth/user', (req, res) => {
  var userOptions = {
    url: 'https://api.spotify.com/v1/me',
    headers: { Authorization: 'Bearer ' + access_token },
    json: true,
  }
  // use the access token to access the Spotify Web API
  request.get(userOptions, function (error, response, body) {
    userId = body.id
    res.json({ body })
  })
})

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Listening at http://localhost:${port}`)
})
