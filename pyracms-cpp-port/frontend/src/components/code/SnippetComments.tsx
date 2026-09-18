'use client'

import { useState } from 'react'
import {
  Typography, Paper, TextField, Button, Divider,
} from '@mui/material'
import { SendOutlined } from '@mui/icons-material'
import api from '@/lib/api'

export function SnippetComments({ id }: { id: string }) {
  const [text, setText] = useState('')

  const post = () => {
    api.post('/api/comments', {
      contentType: 'snippet',
      contentId: Number(id),
      content: text,
    })
      .then(() => setText(''))
      .catch(() => {})
  }

  return (
    <>
      <Divider sx={{ my: 4 }} />
      <Typography variant="h5" gutterBottom>
        Comments
      </Typography>
      <Paper
        variant="outlined"
        sx={{ p: 2, borderColor: 'divider' }}
        data-testid="comment-section"
      >
        <TextField
          fullWidth
          multiline
          minRows={2}
          maxRows={6}
          placeholder="Write a comment..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          sx={{ mb: 1 }}
          data-testid="comment-input"
        />
        <Button
          variant="contained"
          size="small"
          endIcon={<SendOutlined />}
          disabled={!text}
          data-testid="post-comment-btn"
          aria-label="Post comment"
          onClick={post}
        >
          Post Comment
        </Button>
      </Paper>
    </>
  )
}
