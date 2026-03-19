'use client'

import { TextField, Button, Typography, Box, Alert } from '@mui/material'
import Link from 'next/link'
import { useRegister } from '@/hooks/useRegister'

export default function RegisterForm() {
  const { formData, updateField, error, loading, handleSubmit } = useRegister()

  return (
    <>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Register
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <form onSubmit={handleSubmit}>
        <TextField fullWidth label="Username" margin="normal" required
          value={formData.username} onChange={(e) => updateField('username', e.target.value)} />
        <TextField fullWidth label="Email" type="email" margin="normal" required
          value={formData.email} onChange={(e) => updateField('email', e.target.value)} />
        <TextField fullWidth label="Password" type="password" margin="normal" required
          value={formData.password} onChange={(e) => updateField('password', e.target.value)} />
        <TextField fullWidth label="First Name" margin="normal"
          value={formData.firstName} onChange={(e) => updateField('firstName', e.target.value)} />
        <TextField fullWidth label="Last Name" margin="normal"
          value={formData.lastName} onChange={(e) => updateField('lastName', e.target.value)} />
        <Button fullWidth variant="contained" type="submit" disabled={loading} sx={{ mt: 3, mb: 2 }}>
          {loading ? 'Registering...' : 'Register'}
        </Button>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2">
            Already have an account?{' '}
            <Link href="/auth/login" style={{ color: '#1976d2' }}>Login</Link>
          </Typography>
        </Box>
      </form>
    </>
  )
}
