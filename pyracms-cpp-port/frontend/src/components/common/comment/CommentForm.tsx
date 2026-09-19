'use client'

import { useRef, useState } from 'react'
import { Box, TextField } from '@mui/material'
import api from '@/lib/api'
import { apiErrorMessage } from '@/lib/apiError'
import { ErrorAlert } from '../ErrorAlert'
import CommentFormButtons from './CommentFormButtons'
import { MentionAutocomplete } from '../MentionAutocomplete'

interface CommentFormProps {
  contentType: string
  contentId: number
  parentId?: number | null
  placeholder?: string
  submitLabel?: string
  onSubmitted: () => void
  onCancel?: () => void
}

/** Replace the trailing @partial token with the chosen @username. */
export function insertMention(text: string, user: string): string {
  return text.replace(/@\w*$/, `@${user} `)
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
  const [error, setError] = useState('')
  const ref = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = async () => {
    if (!text.trim()) return
    setSubmitting(true)
    setError('')
    try {
      await api.post(`/api/comments/${contentType}/${contentId}`, {
        body: text,
        ...(parentId ? { parentId } : {}),
      })
      setText('')
      onSubmitted()
    } catch (e) {
      setError(apiErrorMessage(e, 'Could not post comment'))
    }
    setSubmitting(false)
  }

  return (
    <Box sx={{ mb: onCancel ? 1 : 3 }}>
      <ErrorAlert error={error} testId="comment-error" />
      <TextField
        fullWidth
        multiline
        minRows={parentId ? 2 : 3}
        size={parentId ? 'small' : 'medium'}
        placeholder={placeholder}
        value={text}
        onChange={(e) => setText(e.target.value)}
        inputRef={ref}
        data-testid="comment-input"
      />
      <MentionAutocomplete
        inputRef={ref}
        onSelect={(u) => setText(insertMention(text, u))}
      />
      <CommentFormButtons
        small={!!parentId}
        label={submitLabel}
        disabled={submitting || !text.trim()}
        onSubmit={handleSubmit}
        {...(onCancel ? { onCancel } : {})}
      />
    </Box>
  )
}
