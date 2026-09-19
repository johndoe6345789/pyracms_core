'use client'

import { useState } from 'react'
import { Alert, Box } from '@mui/material'
import type { Article } from '@/hooks/useArticle'
import ArticleSchedule from './ArticleSchedule'
import ArticleStatusRow from './ArticleStatusRow'
import ArticleDeleteDialog from './ArticleDeleteDialog'
import { useArticleAdmin } from '@/hooks/useArticleAdmin'

interface Props {
  article: Article
  name: string
  tenantId: number | null
  onChanged: () => void
  onDeleted: () => void
}

/** Publish / privacy / delete controls for signed-in users. */
export default function ArticleOwnerActions(p: Props) {
  const a = useArticleAdmin(p.name, p.tenantId, p.onChanged, p.onDeleted)
  const [confirm, setConfirm] = useState(false)
  return (
    <Box sx={{ mb: 3 }} data-testid="article-owner-actions">
      <ArticleStatusRow
        article={p.article}
        a={a}
        onDelete={() => setConfirm(true)}
      />
      <ArticleSchedule
        status={p.article.status ?? 'published'}
        busy={a.busy}
        onSchedule={a.schedule}
        onClear={a.unpublish}
        {...(p.article.scheduledAt
          ? { scheduledAt: p.article.scheduledAt }
          : {})}
      />
      {a.error && (
        <Alert
          severity="error"
          sx={{ mt: 1 }}
          data-testid="article-admin-error"
        >
          {a.error}
        </Alert>
      )}
      <ArticleDeleteDialog
        open={confirm}
        title={p.article.title}
        onClose={() => setConfirm(false)}
        onConfirm={() => {
          setConfirm(false)
          a.remove()
        }}
      />
    </Box>
  )
}
