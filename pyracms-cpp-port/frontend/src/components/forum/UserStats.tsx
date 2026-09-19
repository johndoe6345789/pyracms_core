'use client'

import type { ReactNode } from 'react'
import { Box, Typography } from '@mui/material'
import {
  StarOutlined,
  CalendarTodayOutlined,
  ForumOutlined,
} from '@mui/icons-material'

interface UserStatsProps {
  joinDate: string
  postCount: number
  reputation: number
  rankColor: string
}

const ICON = { fontSize: 14, color: 'text.secondary' }

function Row({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={{
        display: 'flex',
        gap: 0.5,
        alignItems: 'center',
        justifyContent: { md: 'center' },
      }}
    >
      {children}
    </Box>
  )
}

export function UserStats({
  joinDate,
  postCount,
  reputation,
  rankColor,
}: UserStatsProps) {
  return (
    <Box
      sx={{
        display: { xs: 'flex', md: 'block' },
        gap: { xs: 2 },
        flexWrap: 'wrap',
      }}
    >
      <Row>
        <CalendarTodayOutlined sx={ICON} />
        <Typography variant="caption" color="text.secondary">
          {joinDate}
        </Typography>
      </Row>
      <Row>
        <ForumOutlined sx={ICON} />
        <Typography variant="caption" color="text.secondary">
          {postCount.toLocaleString()} posts
        </Typography>
      </Row>
      <Row>
        <StarOutlined sx={{ fontSize: 14, color: rankColor }} />
        <Typography
          variant="caption"
          sx={{ color: rankColor, fontWeight: 600 }}
        >
          {reputation.toLocaleString()} rep
        </Typography>
      </Row>
    </Box>
  )
}
