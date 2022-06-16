import React from 'react'
import { Fab, Link } from '@mui/material'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import { Container } from '@mui/system'
const Login = () => {
  return (
    <Container>
      <Typography
        variant="h1"
        component="div"
        gutterBottom
        color="text.primary"
      >
        Spotify Web App
      </Typography>
      <Card sx={{ maxWidth: 300 }}>
        <CardContent>
          <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
            Check out your most listened to songs
          </Typography>
          <Typography variant="body2">
            <Fab variant="extended">
              <Link href="/auth/login" underline="none">
                Login with Spotify
              </Link>
            </Fab>
          </Typography>
        </CardContent>
      </Card>
    </Container>
  )
}

export default Login
