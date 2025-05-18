import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Typography, Box } from '@mui/material'

const Home = () => {
  const navigate = useNavigate()

  const handleRegister = () => {
    navigate('/signup')
  }

  const handleLogin = () => {
    navigate('/login')
  }

  return (
    <Box 
      sx={{
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh', 
        textAlign: 'center',
      }}
    >
      <Typography variant="h3" gutterBottom>
        Welcome to the Home Page
      </Typography>
      
      <Box sx={{ mt: 3 }}>
        <Button 
          variant="contained" 
          color="primary" 
          sx={{ mr: 2, mb: 2 }} 
          onClick={handleLogin}
        >
          Log In
        </Button>
        <Button 
          variant="outlined" 
          color="secondary" 
          sx={{ mb: 2 }} 
          onClick={handleRegister}
        >
          Register
        </Button>
      </Box>
    </Box>
  )
}

export default Home
