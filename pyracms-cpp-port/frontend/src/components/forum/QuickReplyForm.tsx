'use client'

import { Paper, Typography, Alert } from '@mui/material'
import { replyNotice } from './ReplyNotice'
import { ReplyFormBody } from './ReplyFormBody'

interface QuickReplyFormProps {
  value: string
  onChange: (value: string) => void
  onSubmit?: () => void
  onTyping?: () => void
  submitting?: boolean
  error?: string
  locked?: boolean
  isAuthenticated?: boolean
}

export function QuickReplyForm({
  value,
  onChange,
  onSubmit,
  onTyping,
  submitting = false,
  error,
  locked = false,
  isAuthenticated = true,
}: QuickReplyFormProps) {
  const notice = replyNotice(locked, isAuthenticated)
  return (
    <Paper
      variant="outlined"
      sx={{ p: 3, mt: 4, borderColor: 'divider' }}
      data-testid="quick-reply-form"
    >
      <Typography variant="h6" gutterBottom>
        Reply
      </Typography>
      {notice ? (
        <Alert severity="info" data-testid="reply-disabled-notice">
          {notice}
        </Alert>
      ) : (
        <ReplyFormBody
          value={value}
          onChange={onChange}
          onSubmit={onSubmit}
          onTyping={onTyping}
          submitting={submitting}
          error={error}
        />
      )}
    </Paper>
  )
}
