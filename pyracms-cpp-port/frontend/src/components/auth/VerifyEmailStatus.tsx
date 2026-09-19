'use client'

import { Alert, Box, CircularProgress, Typography } from '@mui/material'
import Link from 'next/link'
import { useVerifyEmail } from '@/hooks/useVerifyEmail'

export default function VerifyEmailStatus({ token }: { token: string }) {
  const { status, message } = useVerifyEmail(token)
  return (
    <Box sx={{ textAlign: 'center' }} data-testid="verify-email">
      <Typography variant="h4" component="h1" gutterBottom fontWeight={700}>
        Email verification
      </Typography>
      {status === 'pending' && (
        <CircularProgress aria-label="Verifying" data-testid="verify-pending" />
      )}
      {status === 'ok' && (
        <Alert severity="success" data-testid="verify-ok">
          Your email is verified.
        </Alert>
      )}
      {status === 'error' && (
        <Alert severity="error" data-testid="verify-error">
          {message}
        </Alert>
      )}
      <Box sx={{ mt: 3 }}>
        <Link href="/auth/login" data-testid="verify-login-link">
          Go to sign in
        </Link>
      </Box>
    </Box>
  )
}
