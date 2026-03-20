'use client'

import {
  Box, Typography, Chip, Divider,
} from '@mui/material'
import {
  CheckCircleOutlined,
  WarningOutlined,
} from '@mui/icons-material'

const HEALTH_INDICATORS = [
  { label: 'Database', status: 'healthy' },
  { label: 'Cache', status: 'healthy' },
  { label: 'Storage', status: 'warning' },
  { label: 'API', status: 'healthy' },
]

function HealthRow({ label, status }: {
  label: string
  status: string
}) {
  const isHealthy = status === 'healthy'
  return (
    <Box sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      <Typography variant="body2">
        {label}
      </Typography>
      <Chip
        icon={isHealthy
          ? <CheckCircleOutlined />
          : <WarningOutlined />}
        label={status}
        size="small"
        color={
          isHealthy ? 'success' : 'warning'
        }
        variant="outlined"
        sx={{ height: 24, fontSize: '0.7rem' }}
        data-testid={
          `health-${label.toLowerCase()}`
        }
      />
    </Box>
  )
}

export default function SystemHealthPanel() {
  return (
    <>
      <Divider sx={{ my: 2 }} />
      <Typography
        variant="subtitle2" gutterBottom
      >
        System Health
      </Typography>
      <Box sx={{
        display: 'flex',
        flexDirection: 'column', gap: 0.5,
      }}>
        {HEALTH_INDICATORS.map((h) => (
          <HealthRow
            key={h.label}
            label={h.label}
            status={h.status}
          />
        ))}
      </Box>
    </>
  )
}
