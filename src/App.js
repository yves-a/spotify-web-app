import React, { useState, useEffect } from 'react'
// import WebPlayback from './WebPlayback'
import Login from './Login'
import Home from './Home'
import { Container } from '@mui/system'

function App() {
  const [token, setToken] = useState('')
  useEffect(() => {
    async function getToken() {
      const response = await fetch('/auth/token')
      const json = await response.json()
      setToken(json.access_token)
    }

    getToken()
  }, [])

  return (
    <Container>
      <center>{token === '' ? <Login /> : <Home token={token} />}</center>
    </Container>
  )
}

export default App
