'use client'

import { Box, Typography } from '@mui/material'
import {
  PersonOutlined,
  CalendarTodayOutlined,
  CodeOutlined,
  VisibilityOutlined,
} from '@mui/icons-material'
import type { ElementType } from 'react'

interface ArticleMetadataProps {
  author: string
  date: string
  renderer: string
  views: number
}

const rowSx = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 3,
  mb: 3,
  color: 'text.secondary',
}
const itemSx = {
  display: 'flex',
  alignItems: 'center',
  gap: 0.5,
}

export function ArticleMetadata({
  author,
  date,
  renderer,
  views,
}: ArticleMetadataProps) {
  const items: [ElementType, string, string][] = [
    [PersonOutlined, author, 'meta-author'],
    [CalendarTodayOutlined, date, 'meta-date'],
    [CodeOutlined, renderer, 'meta-renderer'],
    [VisibilityOutlined, `${views} views`, 'meta-views'],
  ]

  return (
    <Box sx={rowSx} data-testid="article-metadata">
      {items.map(([Icon, label, testId]) => (
        <Box key={testId} sx={itemSx} data-testid={testId}>
          <Icon sx={{ fontSize: 20 }} aria-hidden="true" />
          <Typography variant="body2">{label}</Typography>
        </Box>
      ))}
    </Box>
  )
}
