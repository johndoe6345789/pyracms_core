'use client'

import { useState } from 'react'
import { TextField, Button, Typography, Box } from '@mui/material'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import PasswordField from './PasswordField'
import LoginHeader from './LoginHeader'
import TurboErrorDialog from './TurboErrorDialog'
import { useLogin } from '@/hooks/useLogin'

interface Props {
  redirectTo?: string
}

export default function LoginForm({ redirectTo }: Props) {
  const {
    formData, updateField, error, loading, handleSubmit, loginDirect,
  } = useLogin(redirectTo)
  const router = useRouter()
  const [turboError, setTurboError] = useState<string | null>(null)

  const handleTurboLogin = async () => {
    try {
      const raw = await navigator.clipboard.readText()
      if (!raw.trim()) {
        setTurboError('Clipboard is empty. Copy a Turbologin from Vault first.')
        return
      }
      let data: Record<string, unknown>
      try { data = JSON.parse(raw) } catch {
        setTurboError('Clipboard does not contain valid Turbologin JSON.')
        return
      }
      if (!data.user || !data.pass) {
        setTurboError('Clipboard JSON is missing required fields (user, pass).')
        return
      }
      const ok = await loginDirect(data.user as string, data.pass as string)
      if (ok) router.push(redirectTo ?? '/')
    } catch {
      setTurboError(
        'Could not read clipboard. Please allow clipboard access and try again.'
      )
    }
  }

  return (
    <>
      <TurboErrorDialog
        open={!!turboError}
        message={turboError ?? ''}
        onClose={() => setTurboError(null)}
      />
      <LoginHeader error={error} />
      <form onSubmit={handleSubmit} data-testid="login-form" aria-label="Login form">
        <TextField
          fullWidth label="Username" margin="normal" required
          value={formData.username}
          onChange={(e) => updateField('username', e.target.value)}
          inputProps={{ 'data-testid': 'username-input', 'aria-label': 'Username' }}
          aria-describedby={error ? 'login-error-msg' : undefined}
          sx={{ mb: 2 }}
        />
        <PasswordField
          value={formData.password}
          onChange={(val) => updateField('password', val)}
          data-testid="password-input"
          sx={{ mb: 3 }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
          <Link
            href="/auth/forgot-password"
            data-testid="forgot-password-link"
            aria-label="Forgot your password?"
            style={{ color: '#667eea', textDecoration: 'none', fontSize: '0.875rem' }}
          >
            Forgot password?
          </Link>
        </Box>
        <Button
          fullWidth variant="contained" type="submit"
          disabled={loading} size="large"
          data-testid="login-submit"
          aria-label={loading ? 'Signing in' : 'Sign in'}
          sx={{
            py: 1.5, mb: 2,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5568d3 0%, #63408a 100%)',
            },
          }}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>
        <Button
          fullWidth variant="outlined" type="button"
          disabled={loading} size="large"
          data-testid="turbo-login-button"
          onClick={handleTurboLogin}
          sx={{ mb: 2 }}
        >
          ⚡ Turbologin
        </Button>
      </form>
      <Box sx={{ textAlign: 'center', mt: 3 }}>
        <Typography variant="body2" color="text.secondary">
          Don&apos;t have an account?{' '}
          <Link
            href="/auth/register"
            data-testid="register-link"
            aria-label="Sign up for an account"
            style={{ color: '#667eea', textDecoration: 'none', fontWeight: 600 }}
          >
            Sign Up
          </Link>
        </Typography>
      </Box>
    </>
  )
}
