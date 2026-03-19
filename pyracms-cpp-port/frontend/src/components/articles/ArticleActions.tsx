'use client'

import { Box, Button } from '@mui/material'
import { EditOutlined, HistoryOutlined } from '@mui/icons-material'
import Link from 'next/link'

interface ArticleActionsProps {
  slug: string
  name: string
  revisionNumber: number
}

export function ArticleActions({ slug, name, revisionNumber }: ArticleActionsProps) {
  return (
    <Box sx={{ display: 'flex', gap: 1, mb: 4 }}>
      <Button
        variant="outlined"
        startIcon={<EditOutlined />}
        component={Link}
        href={`/site/${slug}/articles/${name}/edit`}
        size="small"
      >
        Edit
      </Button>
      <Button
        variant="outlined"
        startIcon={<HistoryOutlined />}
        component={Link}
        href={`/site/${slug}/articles/${name}/revisions`}
        size="small"
      >
        Revisions ({revisionNumber})
      </Button>
    </Box>
  )
}
