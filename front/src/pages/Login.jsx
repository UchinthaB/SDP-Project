import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TextField, Button, Typography, Box, CircularProgress } from '@mui/material'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        throw new Error('Invalid credentials')
      }

      const data = await response.json()

      setSuccess('Login successful!')
      localStorage.setItem('user', JSON.stringify(data)) // Store user data in local storage
      localStorage.setItem('token', data.token) // Store token in local storage
      console.log("login successful", data)

        // Redirect based on user role
        const userRole = data.user.role
        if (userRole === 'customer') {
          navigate('/customer/dashboard')  // Updated this line to use the correct path
        }
        else if (userRole === 'employee') {
        navigate('/employee/dashboard')
      }
        else if (userRole === 'owner') {
          navigate('/owner/dashboard')  // Updated this line to use the correct path
        }
        else if (userRole === 'admin') {
          navigate('/admin/dashboard')  // Updated this line to use the correct path
        }
        else {
          navigate('/');  // Redirect to home or an error page
        }

    } catch (err) {
      setError('Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ maxWidth: 400, margin: '0 auto', padding: 3, textAlign: 'center' }}>
      <Typography variant="h4" gutterBottom>Login</Typography>
      {error && <Typography color="error">{error}</Typography>}
      {success && <Typography color="success">{success}</Typography>}
      
      <form onSubmit={handleSubmit}>
        <TextField
          label="Email"
          type="email"
          fullWidth
          variant="outlined"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          sx={{ mb: 2 }}
        />
        <TextField
          label="Password"
          type="password"
          fullWidth
          variant="outlined"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          sx={{ mb: 2 }}
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Login'}
        </Button>
      </form>
      <Typography variant="body2" sx={{ mt: 2 }}>
        Don't have an account? <a href="/signup">Sign Up</a>
      </Typography>
    </Box>
  )
}

export default Login
