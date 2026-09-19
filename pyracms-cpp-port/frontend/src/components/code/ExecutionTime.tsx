import { Box, Typography } from '@mui/material'
import { TimerOutlined } from '@mui/icons-material'

export function formatTime(ms: number): string {
  return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(2)}s`
}

export function ExecutionTime({ ms }: { ms: number }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 'auto' }}>
      <TimerOutlined
        sx={{ fontSize: 14, color: '#64748b' }}
        aria-label="Execution time"
      />
      <Typography variant="caption" color="text.secondary">
        {formatTime(ms)}
      </Typography>
    </Box>
  )
}
