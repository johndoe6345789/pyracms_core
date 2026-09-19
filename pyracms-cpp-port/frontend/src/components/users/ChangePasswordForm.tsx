'use client'

import { Alert, Box, Button, Paper, Typography } from '@mui/material'
import PasswordField from '@/components/auth/PasswordField'
import { useChangePasswordForm } from '@/hooks/useChangePasswordForm'

export default function ChangePasswordForm({ userId }: { userId: number }) {
  const s = useChangePasswordForm(userId)
  return (
    <Paper sx={{ p: 3 }}>
      <Box component="form" onSubmit={s.submit} data-testid="password-form">
        <Typography variant="h6" component="h2" gutterBottom>
          Change password
        </Typography>
        {s.error && (
          <Alert severity="error" sx={{ mb: 1 }} data-testid="password-error">
            {s.error}
          </Alert>
        )}
        {s.done && (
          <Alert severity="success" sx={{ mb: 1 }} data-testid="password-done">
            Password changed.
          </Alert>
        )}
        <PasswordField label="Current password" value={s.current}
          onChange={s.setCurrent} data-testid="pw-current" />
        <PasswordField label="New password" value={s.next}
          onChange={s.setNext} data-testid="pw-new" />
        <PasswordField label="Confirm new password" value={s.confirm}
          onChange={s.setConfirm} data-testid="pw-confirm" />
        <Button type="submit" variant="contained" sx={{ mt: 2 }}
          disabled={s.busy} data-testid="pw-submit">
          {s.busy ? 'Saving...' : 'Change password'}
        </Button>
      </Box>
    </Paper>
  )
}
