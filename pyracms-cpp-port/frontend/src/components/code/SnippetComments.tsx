'use client'

import { useState } from 'react'
import {
  Alert, Typography, Paper, TextField, Button, Divider,
} from '@mui/material'
import { SendOutlined } from '@mui/icons-material'
import { useSnippetComments } from '@/hooks/useSnippetComments'
import { CommentItem } from './CommentItem'

export function SnippetComments({ id }: { id: string }) {
  const [text, setText] = useState('')
  const { comments, loading, error, post } = useSnippetComments(id)

  const submit = () => {
    const body = text.trim()
    if (!body) return
    post(body).then((ok) => ok && setText(''))
  }

  return (
    <>
      <Divider sx={{ my: 4 }} />
      <Typography variant="h5" gutterBottom>
        Comments ({comments.length})
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}
        data-testid="comment-error">{error}</Alert>}
      <div data-testid="comment-list">
        {!loading && comments.length === 0 && (
          <Typography color="text.secondary" data-testid="no-comments">
            No comments yet.
          </Typography>
        )}
        {comments.map((c) => <CommentItem key={c.id} c={c} />)}
      </div>
      <Paper variant="outlined" sx={{ p: 2, mt: 2, borderColor: 'divider' }}
        data-testid="comment-section">
        <TextField
          fullWidth multiline minRows={2} maxRows={6}
          placeholder="Write a comment..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          sx={{ mb: 1 }}
          data-testid="comment-input"
        />
        <Button
          variant="contained" size="small" endIcon={<SendOutlined />}
          disabled={!text.trim()}
          data-testid="post-comment-btn"
          aria-label="Post comment"
          onClick={submit}
        >
          Post Comment
        </Button>
      </Paper>
    </>
  )
}
