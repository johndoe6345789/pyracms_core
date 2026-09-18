'use client'

import { Box, Typography } from '@mui/material'
import type { SnippetComment } from '@/hooks/useSnippetComments'

export function CommentItem({ c }: { c: SnippetComment }) {
  return (
    <Box sx={{ py: 1.5 }} data-testid={`comment-${c.id}`}>
      <Typography variant="subtitle2" component="span">
        {c.author}
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
        {c.date}
      </Typography>
      <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
        {c.body}
      </Typography>
    </Box>
  )
}
