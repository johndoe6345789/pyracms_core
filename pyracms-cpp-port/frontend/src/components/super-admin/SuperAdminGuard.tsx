'use client'

import { Box, CircularProgress, Alert } from '@mui/material'

interface Props {
  hydrated: boolean
  allowed: boolean
  children: React.ReactNode
}

export default function SuperAdminGuard({
  hydrated,
  allowed,
  children,
}: Props) {
  if (!hydrated) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress aria-label="Loading" />
      </Box>
    )
  }

  if (!allowed) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          p: 4,
        }}
        data-testid="super-admin-denied"
      >
        <Alert severity="error" sx={{ maxWidth: 480 }}>
          <strong>Access Denied</strong> — Super Admin
          privileges required.
        </Alert>
      </Box>
    )
  }

  return <>{children}</>
}
