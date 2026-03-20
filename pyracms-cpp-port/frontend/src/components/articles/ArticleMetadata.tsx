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

export function ArticleMetadata(
  {
    author,
    date,
    renderer,
    views,
  }: ArticleMetadataProps
) {
  const items = [
    {
      icon: (
        <PersonOutlined
          sx={{ fontSize: 20 }}
          aria-hidden="true"
        />
      ),
      label: author,
      testId: 'meta-author',
    },
    {
      icon: (
        <CalendarTodayOutlined
          sx={{ fontSize: 20 }}
          aria-hidden="true"
        />
      ),
      label: date,
      testId: 'meta-date',
    },
    {
      icon: (
        <CodeOutlined
          sx={{ fontSize: 20 }}
          aria-hidden="true"
        />
      ),
      label: renderer,
      testId: 'meta-renderer',
    },
    {
      icon: (
        <VisibilityOutlined
          sx={{ fontSize: 20 }}
          aria-hidden="true"
        />
      ),
      label: `${views} views`,
      testId: 'meta-views',
    },
  ]

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 3,
        mb: 3,
        color: 'text.secondary',
      }}
      data-testid="article-metadata"
    >
      {items.map((item) => (
        <Box
          key={item.testId}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
          }}
          data-testid={item.testId}
        >
          {item.icon}
          <Typography variant="body2">
            {item.label}
          </Typography>
        </Box>
      ))}
    </Box>
  )
}
