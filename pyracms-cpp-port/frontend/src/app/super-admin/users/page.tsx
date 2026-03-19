'use client'

import { Box, Typography } from '@mui/material'
import GlobalUsersTable
  from '@/components/super-admin/GlobalUsersTable'

export default function SuperAdminUsersPage() {
  return (
    <Box data-testid="super-admin-users-page">
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{ fontWeight: 700 }}
      >
        Global Users
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mb: 3 }}
      >
        Manage all platform users and their roles.
        Role changes take effect immediately.
      </Typography>
      <GlobalUsersTable />
    </Box>
  )
}
