'use client'

import { TextField, Button, Typography, Box, Alert } from '@mui/material'
import { LoginOutlined } from '@mui/icons-material'
import Link from 'next/link'
import PasswordField from './PasswordField'
import { useLogin } from '@/hooks/useLogin'

export default function LoginForm() {
  const { formData, updateField, error, loading, handleSubmit } = useLogin()

  return (
    <>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <LoginOutlined sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          Welcome Back
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Sign in to continue to PyraCMS
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth label="Username" margin="normal" required
          value={formData.username}
          onChange={(e) => updateField('username', e.target.value)}
          sx={{ mb: 2 }}
        />
        <PasswordField
          value={formData.password}
          onChange={(val) => updateField('password', val)}
          sx={{ mb: 3 }}
        />
        <Button
          fullWidth variant="contained" type="submit" disabled={loading} size="large"
          sx={{
            py: 1.5, mb: 2,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            '&:hover': { background: 'linear-gradient(135deg, #5568d3 0%, #63408a 100%)' },
          }}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>

      <Box sx={{ textAlign: 'center', mt: 3 }}>
        <Typography variant="body2" color="text.secondary">
          Don&apos;t have an account?{' '}
          <Link href="/auth/register" style={{ color: '#667eea', textDecoration: 'none', fontWeight: 600 }}>
            Sign Up
          </Link>
        </Typography>
      </Box>
    </>
  )
}
