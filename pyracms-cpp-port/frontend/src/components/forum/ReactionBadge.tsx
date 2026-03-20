'use client'

import { Box, Typography, Tooltip } from '@mui/material'

interface ReactionBadgeProps {
  emoji: string
  label: string
  count: number
  reacted: boolean
  onClick: () => void
}

export function ReactionBadge({
  emoji,
  label,
  count,
  reacted,
  onClick,
}: ReactionBadgeProps) {
  const borderColor = reacted
    ? 'primary.main'
    : 'divider'
  const bgColor = reacted
    ? 'primary.main' + '14'
    : 'transparent'
  const countColor = reacted
    ? 'primary.main'
    : 'text.secondary'

  return (
    <Tooltip title={label}>
      <Box
        onClick={onClick}
        data-testid={`reaction-${label}`}
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.5,
          px: 1,
          py: 0.25,
          borderRadius: 3,
          border: 1,
          borderColor,
          bgcolor: bgColor,
          cursor: 'pointer',
          '&:hover': {
            bgcolor: 'action.hover',
          },
          transition: 'all 0.15s ease',
        }}
      >
        <Typography
          variant="body2"
          component="span"
        >
          {emoji}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            fontWeight: 600,
            color: countColor,
          }}
        >
          {count}
        </Typography>
      </Box>
    </Tooltip>
  )
}
