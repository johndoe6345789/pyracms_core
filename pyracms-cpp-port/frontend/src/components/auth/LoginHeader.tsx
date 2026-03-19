'use client'

import { Box, Typography, Alert } from '@mui/material'
import { LoginOutlined } from '@mui/icons-material'

interface Props {
  /** Error message to display, if any */
  error: string
}

/** Icon, heading, subtitle, and error/info banners for LoginForm. */
export default function LoginHeader({ error }: Props) {
  return (
    <>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <LoginOutlined
          sx={{ fontSize: 48, color: 'primary.main', mb: 2 }}
          aria-hidden="true"
        />
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{ fontWeight: 700 }}
        >
          Welcome Back
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Sign in to continue to PyraCMS
        </Typography>
      </Box>

      {error && (
        <Alert
          severity="error"
          role="alert"
          id="login-error-msg"
          data-testid="login-error"
          aria-live="assertive"
          sx={{ mb: 3, borderRadius: 2 }}
        >
          {error}
        </Alert>
      )}

      <Alert
        severity="info"
        sx={{ mb: 3, borderRadius: 2 }}
        data-testid="login-info"
      >
        Test credentials:{' '}
        <strong>admin</strong> / <strong>password123</strong>
      </Alert>
    </>
  )
}
