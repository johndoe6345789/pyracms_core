'use client'

import { Box, CircularProgress, Typography } from '@mui/material'

export function OutputLoading() {
  return (
    <Box
      sx={{
        display: 'flex', alignItems: 'center', gap: 2, p: 3,
        bgcolor: '#1e293b', borderRadius: 1,
      }}
      data-testid="code-output-loading"
      role="status"
      aria-label="Running code"
    >
      <CircularProgress size={20} sx={{ color: '#94a3b8' }} />
      <Typography sx={{ color: '#94a3b8', fontFamily: 'monospace' }}>
        Running...
      </Typography>
    </Box>
  )
}
