'use client'

import {
  Box, Typography, Tooltip, LinearProgress,
} from '@mui/material'
import { StarOutlined } from '@mui/icons-material'
import { getLevel, getNextLevel, getProgress } from './reputationLevels'

interface ReputationBadgeProps {
  points: number
}

export function ReputationBadge({ points }: ReputationBadgeProps) {
  const level = getLevel(points)
  const progress = getProgress(points)
  const next = getNextLevel(points)
  const pts = points.toLocaleString()

  const tip = next
    ? `${level.name} - ${pts} points\n`
      + `${next.min - points} points until ${next.name}`
    : `${level.name} - ${pts} points (Max level!)`

  return (
    <Tooltip title={tip} arrow>
      <Box sx={{
        display: 'inline-flex', alignItems: 'center', gap: 1,
        px: 1.5, py: 0.5, borderRadius: 2,
        bgcolor: level.color + '14', cursor: 'default',
      }}>
        <StarOutlined sx={{ fontSize: 18, color: level.color }} />
        <Box>
          <Typography variant="caption" sx={{
            fontWeight: 700, color: level.color,
            display: 'block', lineHeight: 1.2,
          }}>
            {level.name}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <LinearProgress variant="determinate" value={progress}
              sx={{
                width: 60, height: 4, borderRadius: 2,
                bgcolor: level.color + '30',
                '& .MuiLinearProgress-bar': { bgcolor: level.color },
              }} />
            <Typography variant="caption"
              sx={{ fontSize: '0.6rem', color: 'text.secondary' }}>
              {pts}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Tooltip>
  )
}
