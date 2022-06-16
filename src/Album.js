import vinyl from './images/vinyl.png'
import React, { useState, useEffect } from 'react'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import { styled } from '@mui/material/styles'
import { Button, Container, Link } from '@mui/material'
import { Box } from '@mui/system'
import Typography from '@mui/material/Typography'
const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}))

const Album = ({ tracks }) => {
  const [playlistState, setPlaylistState] = useState(false)
  let playing
  let isPlaying = false
  let audio

  useEffect(() => {
    async function getPlaylists() {
      const response = await fetch('/auth/userPlaylists')
      const json = await response.json()
      setPlaylistState(json.madePlaylist)
    }

    getPlaylists()
  }, [])
  const checkAudio = () => {
    if (isPlaying) {
      audio.pause()
      isPlaying = false
    }
    handleAudio()
  }
  const handleAudio = () => {
    if (playing) {
      audio = new Audio(playing)
      audio.play()
      isPlaying = true
    }
  }

  const image =
    'https://images.unsplash.com/photo-1578393098337-5594cce112da?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=617&q=80'
  if (playlistState) {
    return (
      <Container>
        <Stack spacing={1} alignItems="center">
          {tracks.map((track) => {
            return (
              <Button
                key={track.id}
                onClick={() => {
                  playing = track.preview_url
                  checkAudio()
                }}
              >
                <Item sx={{ maxWidth: 300 }}>{track.name}</Item>
              </Button>
            )
          })}
        </Stack>
        <Box>
          <img src={image} width="250px" height="250px"></img>
          <img src={vinyl} width="250" height="250"></img>
        </Box>
        <Typography
          variant="body1"
          component="div"
          gutterBottom
          color="text.secondary"
        >
          Checkout Your New Playlist on Spotify
        </Typography>
        <Typography
          variant="body2"
          component="div"
          gutterBottom
          color="text.secondary"
        >
          <Link href="https://unsplash.com/photos/iLAAT1E-H_8">
            Checkout the Album Art on Unsplash
          </Link>
        </Typography>
      </Container>
    )
  }

  return (
    <Container>
      <Stack spacing={1} alignItems="center">
        {tracks.map((track) => {
          return (
            <Button
              key={track.id}
              onClick={() => {
                playing = track.preview_url
                checkAudio()
              }}
            >
              <Item sx={{ maxWidth: 300 }}>{track.name}</Item>
            </Button>
          )
        })}
      </Stack>
      <Box>
        <a href="/auth/playlist" onClick={() => setPlaylistState(true)}>
          <img src={image} width="250px" height="250px"></img>
        </a>
        <img src={vinyl} width="250" height="250"></img>
      </Box>
      <Typography
        variant="body1"
        component="div"
        gutterBottom
        color="text.secondary"
      >
        Click the Album Cover to Create Your Custom Playlist With Your Top Hits
      </Typography>
      <Typography
        variant="body2"
        component="div"
        gutterBottom
        color="text.secondary"
      >
        <Link href="https://unsplash.com/photos/iLAAT1E-H_8">
          Checkout the Album Art on Unsplash
        </Link>
      </Typography>
    </Container>
  )
}

export default Album
