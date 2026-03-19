'use client'

import {
  TextField, Button, Typography, Box, Alert,
} from '@mui/material'
import Link from 'next/link'
import { useRegister } from '@/hooks/useRegister'

export default function RegisterForm() {
  const {
    formData, updateField,
    error, loading, handleSubmit,
  } = useRegister()

  return (
    <>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        align="center"
      >
        Register
      </Typography>

      {error && (
        <Alert
          severity="error"
          role="alert"
          data-testid="register-error"
          aria-live="assertive"
          sx={{ mb: 2 }}
        >
          {error}
        </Alert>
      )}

      <form
        onSubmit={handleSubmit}
        data-testid="register-form"
        aria-label="Registration form"
      >
        <TextField
          fullWidth
          label="Username"
          margin="normal"
          required
          value={formData.username}
          onChange={(e) =>
            updateField(
              'username', e.target.value,
            )
          }
          inputProps={{
            'data-testid':
              'register-username-input',
            'aria-label': 'Username',
          }}
          aria-describedby={
            error
              ? 'register-error-msg'
              : undefined
          }
        />
        <TextField
          fullWidth
          label="Email"
          type="email"
          margin="normal"
          required
          value={formData.email}
          onChange={(e) =>
            updateField(
              'email', e.target.value,
            )
          }
          inputProps={{
            'data-testid':
              'register-email-input',
            'aria-label': 'Email',
          }}
        />
        <TextField
          fullWidth
          label="Password"
          type="password"
          margin="normal"
          required
          value={formData.password}
          onChange={(e) =>
            updateField(
              'password', e.target.value,
            )
          }
          inputProps={{
            'data-testid':
              'register-password-input',
            'aria-label': 'Password',
          }}
        />
        <TextField
          fullWidth
          label="First Name"
          margin="normal"
          value={formData.firstName}
          onChange={(e) =>
            updateField(
              'firstName', e.target.value,
            )
          }
          inputProps={{
            'data-testid':
              'register-firstname-input',
            'aria-label': 'First Name',
          }}
        />
        <TextField
          fullWidth
          label="Last Name"
          margin="normal"
          value={formData.lastName}
          onChange={(e) =>
            updateField(
              'lastName', e.target.value,
            )
          }
          inputProps={{
            'data-testid':
              'register-lastname-input',
            'aria-label': 'Last Name',
          }}
        />
        <Button
          fullWidth
          variant="contained"
          type="submit"
          disabled={loading}
          data-testid="register-submit"
          aria-label={
            loading
              ? 'Registering'
              : 'Register'
          }
          sx={{ mt: 3, mb: 2 }}
        >
          {loading
            ? 'Registering...'
            : 'Register'}
        </Button>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2">
            Already have an account?{' '}
            <Link
              href="/auth/login"
              data-testid="login-link"
              aria-label="Go to login page"
              style={{ color: '#1976d2' }}
            >
              Login
            </Link>
          </Typography>
        </Box>
      </form>
    </>
  )
}
