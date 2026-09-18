'use client'

import { Box, IconButton, Typography } from '@mui/material'
import type { ReactNode } from 'react'

interface Props {
  label: string
  testId: string
  count: number
  icon: ReactNode
  color: 'primary' | 'default'
  disabled: boolean
  onClick: () => void
}

export function VoteButton(p: Props) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <IconButton
        size="small"
        color={p.color}
        disabled={p.disabled}
        onClick={p.onClick}
        aria-label={p.label}
        data-testid={`vote-${p.testId}-button`}
      >
        {p.icon}
      </IconButton>
      <Typography
        variant="body2"
        sx={{ fontWeight: 600 }}
        data-testid={`vote-${p.testId}-count`}
      >
        {p.count}
      </Typography>
    </Box>
  )
}
