'use client'

import { Button, Alert } from '@mui/material'
import { SendOutlined } from '@mui/icons-material'
import { MentionTextField } from '../common/MentionTextField'

interface Props {
  value: string
  onChange: (value: string) => void
  onSubmit?: (() => void) | undefined
  onTyping?: (() => void) | undefined
  submitting: boolean
  error?: string | undefined
}

/** Error alert, editor and submit button of the quick reply. */
export function ReplyFormBody({
  value,
  onChange,
  onSubmit,
  onTyping,
  submitting,
  error,
}: Props) {
  return (
    <>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} data-testid="reply-error">
          {error}
        </Alert>
      )}
      <MentionTextField
        fullWidth
        multiline
        minRows={3}
        maxRows={8}
        placeholder="Write your reply..."
        value={value}
        onValue={(v) => {
          onChange(v)
          onTyping?.()
        }}
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
    </>
  )
}
