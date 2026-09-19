'use client'

import { Alert, Box, Button, Typography } from '@mui/material'
import Link from 'next/link'
import PasswordField from './PasswordField'
import { useResetPassword } from '@/hooks/useResetPassword'

export default function ResetPasswordForm({
  token,
  tenant,
}: {
  token: string
  tenant?: string | undefined
}) {
  const s = useResetPassword(token)
  const login = tenant
    ? `/auth/login?tenant=${encodeURIComponent(tenant)}`
    : '/auth/login'
  return (
    <Box component="form" onSubmit={s.submit} data-testid="reset-form">
      <Typography variant="h4" component="h1" gutterBottom fontWeight={700}>
        Choose a new password
      </Typography>
      {s.error && (
        <Alert severity="error" sx={{ mb: 2 }} data-testid="reset-error">
          {s.error}
        </Alert>
      )}
      {s.done ? (
        <Alert severity="success" data-testid="reset-done">
          Password updated. You can now{' '}
          <Link href={login} data-testid="reset-login-link">
            sign in
          </Link>
          .
        </Alert>
      ) : (
        <>
          <PasswordField
            label="New password"
            value={s.password}
            onChange={s.setPassword}
            data-testid="reset-password"
          />
          <PasswordField
            label="Confirm password"
            value={s.confirm}
            onChange={s.setConfirm}
            data-testid="reset-confirm"
          />
          <Button
            fullWidth
            type="submit"
            variant="contained"
            size="large"
            disabled={s.busy}
            sx={{ mt: 2 }}
            data-testid="reset-submit"
          >
            {s.busy ? 'Saving...' : 'Reset password'}
          </Button>
        </>
      )}
    </Box>
  )
}
