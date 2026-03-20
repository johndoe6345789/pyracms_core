'use client'

import { Box, Typography, Alert } from '@mui/material'
import { TuneOutlined } from '@mui/icons-material'

export default function SuperAdminSettingsPage() {
  return (
    <Box data-testid="super-admin-settings-page">
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          mb: 3,
        }}
      >
        <TuneOutlined
          sx={{ color: 'warning.main' }}
          aria-hidden="true"
        />
        <Typography
          variant="h4"
          component="h1"
          sx={{ fontWeight: 700 }}
        >
          Platform Settings
        </Typography>
      </Box>
      <Alert severity="info" sx={{ maxWidth: 600 }}>
        Global platform settings will appear here.
        These apply across all tenants on this
        PyraCMS installation.
      </Alert>
    </Box>
  )
}
