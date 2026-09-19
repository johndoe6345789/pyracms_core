'use client'

import { Alert, Box, Button, TextField, Typography } from '@mui/material'
import Link from 'next/link'
import { useForgotPassword } from '@/hooks/useForgotPassword'

export default function ForgotPasswordForm({
  tenant,
}: {
  tenant?: string | undefined
}) {
  const s = useForgotPassword(tenant)
  const back = tenant
    ? `/auth/login?tenant=${encodeURIComponent(tenant)}`
    : '/auth/login'
  return (
    <Box component="form" onSubmit={s.submit} data-testid="forgot-form">
      <Typography variant="h4" component="h1" gutterBottom fontWeight={700}>
        Forgot password
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Enter your account email and we will send you a reset link.
      </Typography>
      {s.error && (
        <Alert severity="error" sx={{ mb: 2 }} data-testid="forgot-error">
          {s.error}
        </Alert>
      )}
      {s.done ? (
        <Alert severity="success" data-testid="forgot-done">
          If the email exists, a reset link has been sent.
        </Alert>
      ) : (
        <>
          <TextField
            fullWidth
            required
            type="email"
            label="Email"
            margin="normal"
            value={s.email}
            onChange={(e) => s.setEmail(e.target.value)}
            inputProps={{ 'data-testid': 'forgot-email' }}
          />
          <Button
            fullWidth
            type="submit"
            variant="contained"
            size="large"
            disabled={s.busy}
            sx={{ mt: 2 }}
            data-testid="forgot-submit"
          >
            {s.busy ? 'Sending...' : 'Send reset link'}
          </Button>
        </>
      )}
      <Box sx={{ textAlign: 'center', mt: 3 }}>
        <Link href={back} data-testid="forgot-back">
          Back to sign in
        </Link>
      </Box>
    </Box>
  )
}
