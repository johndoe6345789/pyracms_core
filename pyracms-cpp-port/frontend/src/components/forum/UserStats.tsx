'use client'

import { Box, Typography } from '@mui/material'
import {
  StarOutlined, CalendarTodayOutlined,
  ForumOutlined,
} from '@mui/icons-material'

interface UserStatsProps {
  joinDate: string
  postCount: number
  reputation: number
  rankColor: string
}

export function UserStats({
  joinDate, postCount, reputation, rankColor,
}: UserStatsProps) {
  return (
    <Box sx={{
      display: { xs: 'flex', md: 'block' },
      gap: { xs: 2 }, flexWrap: 'wrap',
    }}>
      <Box sx={{
        display: 'flex', gap: 0.5,
        alignItems: 'center',
        justifyContent: { md: 'center' },
      }}>
        <CalendarTodayOutlined sx={{
          fontSize: 14,
          color: 'text.secondary',
        }} />
        <Typography variant="caption"
          color="text.secondary"
        >{joinDate}</Typography>
      </Box>
      <Box sx={{
        display: 'flex', gap: 0.5,
        alignItems: 'center',
        justifyContent: { md: 'center' },
      }}>
        <ForumOutlined sx={{
          fontSize: 14,
          color: 'text.secondary',
        }} />
        <Typography variant="caption"
          color="text.secondary"
        >{postCount.toLocaleString()} posts
        </Typography>
      </Box>
      <Box sx={{
        display: 'flex', gap: 0.5,
        alignItems: 'center',
        justifyContent: { md: 'center' },
      }}>
        <StarOutlined sx={{
          fontSize: 14, color: rankColor,
        }} />
        <Typography variant="caption" sx={{
          color: rankColor, fontWeight: 600,
        }}>
          {reputation.toLocaleString()} rep
        </Typography>
      </Box>
    </Box>
  )
}
