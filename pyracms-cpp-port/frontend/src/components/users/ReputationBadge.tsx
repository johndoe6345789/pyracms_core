'use client'

import { Box, Typography, Tooltip, LinearProgress } from '@mui/material'
import { StarOutlined } from '@mui/icons-material'

interface ReputationBadgeProps {
  points: number
}

interface Level {
  name: string
  min: number
  max: number
  color: string
}

const LEVELS: Level[] = [
  { name: 'Newcomer', min: 0, max: 50, color: '#9e9e9e' },
  { name: 'Member', min: 50, max: 200, color: '#8d6e63' },
  { name: 'Active', min: 200, max: 500, color: '#43a047' },
  { name: 'Trusted', min: 500, max: 1000, color: '#1976d2' },
  { name: 'Expert', min: 1000, max: 2500, color: '#7b1fa2' },
  { name: 'Master', min: 2500, max: 5000, color: '#f57c00' },
  { name: 'Legend', min: 5000, max: 10000, color: '#FFD700' },
]

function getLevel(points: number): Level {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (points >= LEVELS[i].min) return LEVELS[i]
  }
  return LEVELS[0]
}

function getProgress(points: number): number {
  const level = getLevel(points)
  const range = level.max - level.min
  const progress = points - level.min
  return Math.min((progress / range) * 100, 100)
}

function getNextLevel(points: number): Level | null {
  const currentIdx = LEVELS.findIndex((l) => l.min <= points && points < l.max)
  if (currentIdx < LEVELS.length - 1) return LEVELS[currentIdx + 1]
  return null
}

export function ReputationBadge({ points }: ReputationBadgeProps) {
  const level = getLevel(points)
  const progress = getProgress(points)
  const nextLevel = getNextLevel(points)

  const tooltipContent = nextLevel
    ? `${level.name} - ${points.toLocaleString()} points\n${nextLevel.min - points} points until ${nextLevel.name}`
    : `${level.name} - ${points.toLocaleString()} points (Max level!)`

  return (
    <Tooltip title={tooltipContent} arrow>
      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, px: 1.5, py: 0.5, borderRadius: 2, bgcolor: level.color + '14', cursor: 'default' }}>
        <StarOutlined sx={{ fontSize: 18, color: level.color }} />
        <Box>
          <Typography variant="caption" sx={{ fontWeight: 700, color: level.color, display: 'block', lineHeight: 1.2 }}>
            {level.name}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{ width: 60, height: 4, borderRadius: 2, bgcolor: level.color + '30', '& .MuiLinearProgress-bar': { bgcolor: level.color } }}
            />
            <Typography variant="caption" sx={{ fontSize: '0.6rem', color: 'text.secondary' }}>
              {points.toLocaleString()}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Tooltip>
  )
}
