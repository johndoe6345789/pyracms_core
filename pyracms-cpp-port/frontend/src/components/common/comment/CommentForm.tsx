'use client'

import { useState } from 'react'
import {
  Box, TextField, Button,
} from '@mui/material'
import api from '@/lib/api'

interface CommentFormProps {
  contentType: string
  contentId: number
  parentId?: number | null
  placeholder?: string
  submitLabel?: string
  onSubmitted: () => void
  onCancel?: () => void
}

export default function CommentForm({
  contentType,
  contentId,
  parentId = null,
  placeholder = 'Write a comment...',
  submitLabel = 'Post Comment',
  onSubmitted,
  onCancel,
}: CommentFormProps) {
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!text.trim()) return
    setSubmitting(true)
    try {
      const url =
        `/api/comments/${contentType}/${contentId}`
      await api.post(url, {
        content: text,
        parent_id: parentId,
      })
      setText('')
      onSubmitted()
    } catch { /* ignore */ }
    setSubmitting(false)
  }

  return (
    <Box sx={{ mb: onCancel ? 1 : 3 }}>
      <TextField
        fullWidth
        multiline
        minRows={parentId ? 2 : 3}
        size={parentId ? 'small' : 'medium'}
        placeholder={placeholder}
        value={text}
        onChange={(e) => setText(e.target.value)}
        data-testid="comment-input"
      />
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 1,
          mt: 1,
        }}
      >
        {onCancel && (
          <Button
            size="small"
            onClick={onCancel}
            data-testid="comment-cancel-btn"
          >
            Cancel
          </Button>
        )}
        <Button
          size={parentId ? 'small' : 'medium'}
          variant="contained"
          onClick={handleSubmit}
          disabled={submitting || !text.trim()}
          data-testid="comment-submit-btn"
        >
          {submitLabel}
        </Button>
      </Box>
    </Box>
  )
}
