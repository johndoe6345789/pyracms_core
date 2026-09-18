'use client'

import { Typography } from '@mui/material'

/** Shows a live "is typing" hint when other users are replying. */
export function TypingIndicator({ count }: { count: number }) {
  if (count <= 0) return null
  return (
    <Typography variant="caption" color="text.secondary"
      sx={{ display: 'block', mt: 1 }} data-testid="typing-indicator">
      {count === 1 ? 'Someone is typing...' : 'Several people are typing...'}
    </Typography>
  )
}
