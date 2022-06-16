import React, { useState, useEffect } from 'react'
import Album from './Album'
import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'
import { Container } from '@mui/system'
const Home = () => {
  const [tracks, setTracks] = useState('')
  const [user, setUser] = useState('')
  useEffect(() => {
    async function getInfo() {
      const userResponse = await fetch('/auth/user')
      const json = await userResponse.json()

      setUser(json.body)

      const tracksResponse = await fetch('/auth/tracks')
      const jsonTracks = await tracksResponse.json()
      setTracks(jsonTracks.body)
    }

    getInfo()
  }, [])
  if (tracks && user) {
    return (
      <Container>
        <center>
          <Typography
            variant="h2"
            component="div"
            gutterBottom
            color="text.primary"
          >
            {
              // eslint-disable-next-line quotes
              user.display_name ? user.display_name + "'s" : 'Your'
            }{' '}
            Favourite Tracks This Month
          </Typography>
        </center>
        <Album tracks={tracks.items} />
      </Container>
    )
  }
  return (
    <Box sx={{ width: 300 }}>
      <Skeleton />
      <Skeleton animation="wave" />
      <Skeleton animation={false} />
    </Box>
  )
}

export default Home
