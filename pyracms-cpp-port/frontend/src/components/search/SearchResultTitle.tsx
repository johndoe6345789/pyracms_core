'use client'

import {
  ArticleOutlined,
  CodeOutlined,
  ForumOutlined,
  PersonOutlined,
  SportsEsportsOutlined,
} from '@mui/icons-material'
import {
  Box,
  Chip,
  Typography,
} from '@mui/material'
import { type SearchResult } from '@/hooks/useSearchPage'

export const TYPE_ICONS: Record<string, React.ReactNode> = {
  article: <ArticleOutlined />,
  forum_post: <ForumOutlined />,
  snippet: <CodeOutlined />,
  gamedep: <SportsEsportsOutlined />,
  user: <PersonOutlined />,
}

const TYPE_COLORS: Record<string, string> = {
  article: '#1976d2',
  forum_post: '#ed6c02',
  snippet: '#2e7d32',
  gamedep: '#0097a7',
  user: '#9c27b0',
}

export function SearchResultTitle({
  result,
}: {
  result: SearchResult
}) {
  const color = TYPE_COLORS[result.type] || '#666'
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
        {result.title}
      </Typography>
      <Chip
        label={result.type}
        size="small"
        sx={{
          height: 20,
          fontSize: '0.65rem',
          bgcolor: `${color}20`,
          color,
        }}
      />
    </Box>
  )
}
