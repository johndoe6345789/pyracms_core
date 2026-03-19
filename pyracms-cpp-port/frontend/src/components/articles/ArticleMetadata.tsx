'use client'

import { Box, Typography } from '@mui/material'
import {
  PersonOutlined,
  CalendarTodayOutlined,
  CodeOutlined,
  VisibilityOutlined,
} from '@mui/icons-material'

interface ArticleMetadataProps {
  author: string
  date: string
  renderer: string
  views: number
}

export function ArticleMetadata({ author, date, renderer, views }: ArticleMetadataProps) {
  const items = [
    { icon: <PersonOutlined sx={{ fontSize: 20 }} />, label: author },
    { icon: <CalendarTodayOutlined sx={{ fontSize: 20 }} />, label: date },
    { icon: <CodeOutlined sx={{ fontSize: 20 }} />, label: renderer },
    { icon: <VisibilityOutlined sx={{ fontSize: 20 }} />, label: `${views} views` },
  ]

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 3, mb: 3, color: 'text.secondary' }}>
      {items.map((item) => (
        <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {item.icon}
          <Typography variant="body2">{item.label}</Typography>
        </Box>
      ))}
    </Box>
  )
}
