'use client'

import { Box, Chip, Typography } from '@mui/material'
import {
  CheckCircleOutlined,
  ErrorOutlined,
  TimerOutlined,
} from '@mui/icons-material'

interface Props {
  exitCode?: number | null | undefined
  executionTime?: number | null | undefined
}

export function formatTime(ms: number): string {
  return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(2)}s`
}

export function OutputHeader({ exitCode, executionTime }: Props) {
  const ok = exitCode === 0
  const failed = exitCode != null && !ok
  let bg = '#f8fafc'
  let color = '#64748b'
  if (ok) {
    bg = '#f0fdf4'
    color = '#166534'
  }
  if (failed) {
    bg = '#fef2f2'
    color = '#991b1b'
  }
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        px: 2,
        py: 1,
        bgcolor: bg,
        borderBottom: 1,
        borderColor: 'divider',
      }}
    >
      {ok && (
        <CheckCircleOutlined
          sx={{ fontSize: 16, color: '#16a34a' }}
          aria-label="Success"
        />
      )}
      {failed && (
        <ErrorOutlined
          sx={{ fontSize: 16, color: '#dc2626' }}
          aria-label="Error"
        />
      )}
      <Typography
        variant="caption"
        sx={{
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color,
        }}
      >
        Output
      </Typography>
      {exitCode != null && (
        <Chip
          label={`Exit: ${exitCode}`}
          size="small"
          sx={{
            height: 20,
            fontSize: '0.7rem',
            color,
            bgcolor: ok ? '#dcfce7' : '#fee2e2',
          }}
        />
      )}
      {executionTime != null && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            ml: 'auto',
          }}
        >
          <TimerOutlined
            sx={{ fontSize: 14, color: '#64748b' }}
            aria-label="Execution time"
          />
          <Typography variant="caption" color="text.secondary">
            {formatTime(executionTime)}
          </Typography>
        </Box>
      )}
    </Box>
  )
}
