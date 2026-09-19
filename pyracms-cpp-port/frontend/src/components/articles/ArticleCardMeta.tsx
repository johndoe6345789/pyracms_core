'use client'

import { Box, Typography } from '@mui/material'
import {
  PersonOutlined,
  CalendarTodayOutlined,
  VisibilityOutlined,
} from '@mui/icons-material'

interface ArticleCardMetaProps {
  author: string
  date: string
  views: number
}

const rowSx = {
  display: 'flex',
  alignItems: 'center',
  gap: 2,
  color: 'text.secondary',
  fontSize: '0.875rem',
}
const itemSx = {
  display: 'flex',
  alignItems: 'center',
  gap: 0.5,
}

export function ArticleCardMeta({ author, date, views }: ArticleCardMetaProps) {
  return (
    <Box sx={rowSx}>
      <Box sx={itemSx}>
        <PersonOutlined sx={{ fontSize: 16 }} />
        <Typography variant="caption">{author}</Typography>
      </Box>
      <Box sx={itemSx}>
        <CalendarTodayOutlined sx={{ fontSize: 16 }} />
        <Typography variant="caption">{date}</Typography>
      </Box>
      <Box sx={itemSx}>
        <VisibilityOutlined sx={{ fontSize: 16 }} />
        <Typography variant="caption">{views}</Typography>
      </Box>
    </Box>
  )
}
