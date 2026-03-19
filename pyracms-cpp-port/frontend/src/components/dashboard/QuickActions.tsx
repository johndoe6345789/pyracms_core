'use client'

import { Paper, Typography, Box } from '@mui/material'

const ACTIONS = [
  'Create New Content',
  'Manage Users',
  'View Analytics',
  'Plugin Settings',
]

export default function QuickActions() {
  return (
    <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
        Quick Actions
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Common tasks
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {ACTIONS.map((action, i) => (
          <Box
            key={i}
            sx={{
              p: 2, borderRadius: 2, bgcolor: 'background.default',
              cursor: 'pointer', transition: 'all 0.2s',
              '&:hover': { bgcolor: 'primary.main', color: 'white', transform: 'translateX(4px)' },
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 600 }}>{action}</Typography>
          </Box>
        ))}
      </Box>
    </Paper>
  )
}
