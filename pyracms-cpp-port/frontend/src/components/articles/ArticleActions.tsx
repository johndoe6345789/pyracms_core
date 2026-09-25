'use client'

import { Box, Button } from '@mui/material'
import { EditOutlined, HistoryOutlined } from '@mui/icons-material'
import Link from 'next/link'

interface ArticleActionsProps {
  slug: string
  name: string
  revisionCount: number
}

export function ArticleActions({
  slug,
  name,
  revisionCount,
}: ArticleActionsProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1.5,
        flexWrap: 'wrap',
        mb: 4,
      }}
      data-testid="article-actions"
    >
      <Button
        variant="contained"
        startIcon={<EditOutlined />}
        component={Link}
        href={`/site/${slug}` + `/articles/${name}/edit`}
        size="medium"
        data-testid="edit-article-btn"
        aria-label="Edit article"
      >
        Edit
      </Button>
      <Button
        variant="outlined"
        startIcon={<HistoryOutlined />}
        component={Link}
        href={`/site/${slug}` + `/articles/${name}` + `/revisions`}
        size="medium"
        color="secondary"
        sx={{ borderWidth: 2, '&:hover': { borderWidth: 2 } }}
        data-testid="revisions-btn"
        aria-label={`View revisions ` + `(${revisionCount})`}
      >
        Revisions ({revisionCount})
      </Button>
    </Box>
  )
}
