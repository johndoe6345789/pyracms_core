'use client'

import { Box, Typography } from '@mui/material'
import type { Comment } from './types'
import { timeAgo } from './types'

export default function CommentHeader({
  comment,
}: {
  comment: Comment
}) {
  const edited =
    comment.updated_at !== comment.created_at
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        mb: 0.5,
      }}
    >
      <Typography
        variant="body2"
        fontWeight={600}
      >
        {comment.username}
      </Typography>
      <Typography
        variant="caption"
        color="text.secondary"
      >
        {timeAgo(comment.created_at)}
      </Typography>
      {edited && (
        <Typography
          variant="caption"
          color="text.secondary"
          fontStyle="italic"
        >
          (edited)
        </Typography>
      )}
    </Box>
  )
}
