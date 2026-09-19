'use client'

import { useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material'
import type { Article } from '@/hooks/useArticle'
import ArticleSchedule from './ArticleSchedule'
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
  const published = p.article.status === 'published'
  return (
    <Box sx={{ mb: 3 }} data-testid="article-owner-actions">
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
          label={p.article.status ?? 'published'}
          color={published ? 'success' : 'default'}
          data-testid="article-status"
        />
        {p.article.isPrivate && (
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
          {p.article.isPrivate ? 'Make public' : 'Make private'}
        </Button>
        <Button
          size="small"
          color="error"
          disabled={a.busy}
          onClick={() => setConfirm(true)}
          data-testid="article-delete-btn"
        >
          Delete
        </Button>
      </Box>
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
      <Dialog
        open={confirm}
        onClose={() => setConfirm(false)}
        data-testid="article-delete-dialog"
      >
        <DialogTitle>Delete article</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Delete &quot;{p.article.title}&quot; and all its revisions? This
            cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirm(false)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => {
              setConfirm(false)
              a.remove()
            }}
            data-testid="article-delete-confirm"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
