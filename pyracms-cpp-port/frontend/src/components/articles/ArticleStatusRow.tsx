'use client'

import { Box, Button, Chip } from '@mui/material'
import type { Article } from '@/hooks/useArticle'
import type { useArticleAdmin } from '@/hooks/useArticleAdmin'

interface Props {
  article: Article
  a: ReturnType<typeof useArticleAdmin>
  onDelete: () => void
}

export default function ArticleStatusRow({ article, a, onDelete }: Props) {
  const published = article.status === 'published'
  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1,
        alignItems: 'center',
        flexWrap: 'wrap',
      }}
    >
      <Chip
        size="small"
        label={article.status ?? 'published'}
        color={published ? 'success' : 'default'}
        data-testid="article-status"
      />
      {article.isPrivate && (
        <Chip size="small" label="private" data-testid="article-private" />
      )}
      <Button
        size="small"
        disabled={a.busy}
        onClick={published ? a.unpublish : a.publish}
        data-testid="article-publish-btn"
      >
        {published ? 'Unpublish' : 'Publish'}
      </Button>
      <Button
        size="small"
        disabled={a.busy}
        onClick={a.togglePrivate}
        data-testid="article-private-btn"
      >
        {article.isPrivate ? 'Make public' : 'Make private'}
      </Button>
      <Button
        size="small"
        color="error"
        disabled={a.busy}
        onClick={onDelete}
        data-testid="article-delete-btn"
      >
        Delete
      </Button>
    </Box>
  )
}
