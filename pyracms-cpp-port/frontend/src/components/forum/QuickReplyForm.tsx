'use client'

import {
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
} from '@mui/material'
import { SendOutlined } from '@mui/icons-material'
import type { ReactNode } from 'react'
import Link from 'next/link'

interface QuickReplyFormProps {
  value: string
  onChange: (value: string) => void
  onSubmit?: () => void
  submitting?: boolean
  error?: string
  locked?: boolean
  isAuthenticated?: boolean
}

export function QuickReplyForm({
  value, onChange, onSubmit, submitting = false,
  error, locked = false, isAuthenticated = true,
}: QuickReplyFormProps) {
  let notice: ReactNode = null
  if (locked) {
    notice = 'This thread is locked. New replies are disabled.'
  } else if (!isAuthenticated) {
    notice = (
      <>
        <Link href="/auth/login">Sign in</Link>
        {' '}to reply to this thread.
      </>
    )
  }
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
      ) : (<>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}
            data-testid="reply-error">
            {error}
          </Alert>
        )}
        <TextField
          fullWidth
          multiline
          minRows={3}
          maxRows={8}
          placeholder="Write your reply..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          sx={{ mb: 2 }}
          inputProps={{
            'aria-label': 'Reply content',
            'data-testid': 'quick-reply-input',
          }}
        />
        <Button
          variant="contained"
          endIcon={<SendOutlined />}
          onClick={onSubmit}
          disabled={!value.trim() || submitting}
          aria-label="Submit reply"
          data-testid="quick-reply-submit"
        >
          {submitting ? 'Posting...' : 'Submit Reply'}
        </Button>
      </>)}
    </Paper>
  )
}
