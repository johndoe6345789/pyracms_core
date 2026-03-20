'use client'

import { TextField, Button, Typography, Box } from '@mui/material'
import Link from 'next/link'
import PasswordField from './PasswordField'
import LoginHeader from './LoginHeader'
import { useLogin } from '@/hooks/useLogin'

interface Props {
  /** Where to redirect after successful login. Defaults to '/'. */
  redirectTo?: string
}

/** Login form with username/password fields and post-login redirect. */
export default function LoginForm({ redirectTo }: Props) {
  const {
    formData, updateField, error, loading, handleSubmit,
  } = useLogin(redirectTo)

  return (
    <>
      <LoginHeader error={error} />

      <form
        onSubmit={handleSubmit}
        data-testid="login-form"
        aria-label="Login form"
      >
        <TextField
          fullWidth
          label="Username"
          margin="normal"
          required
          value={formData.username}
          onChange={(e) =>
            updateField('username', e.target.value)
          }
          inputProps={{
            'data-testid': 'username-input',
            'aria-label': 'Username',
          }}
          aria-describedby={
            error ? 'login-error-msg' : undefined
          }
          sx={{ mb: 2 }}
        />
        <PasswordField
          value={formData.password}
          onChange={(val) =>
            updateField('password', val)
          }
          data-testid="password-input"
          sx={{ mb: 3 }}
        />
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            mb: 1,
          }}
        >
          <Link
            href="/auth/forgot-password"
            data-testid="forgot-password-link"
            aria-label="Forgot your password?"
            style={{
              color: '#667eea',
              textDecoration: 'none',
              fontSize: '0.875rem',
            }}
          >
            Forgot password?
          </Link>
        </Box>
        <Button
          fullWidth
          variant="contained"
          type="submit"
          disabled={loading}
          size="large"
          data-testid="login-submit"
          aria-label={loading ? 'Signing in' : 'Sign in'}
          sx={{
            py: 1.5,
            mb: 2,
            background:
              'linear-gradient(135deg, #667eea 0%,'
              + ' #764ba2 100%)',
            '&:hover': {
              background:
                'linear-gradient(135deg, #5568d3 0%,'
                + ' #63408a 100%)',
            },
          }}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>

      <Box sx={{ textAlign: 'center', mt: 3 }}>
        <Typography variant="body2" color="text.secondary">
          Don&apos;t have an account?{' '}
          <Link
            href="/auth/register"
            data-testid="register-link"
            aria-label="Sign up for an account"
            style={{
              color: '#667eea',
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            Sign Up
          </Link>
        </Typography>
      </Box>
    </>
  )
}
