'use client'

import NextLink from 'next/link'
import { useParams } from 'next/navigation'
import { Box, Typography, Link } from '@mui/material'
import type { Comment } from './types'
import { timeAgo } from './types'

export default function CommentHeader({
  comment,
}: {
  comment: Comment
}) {
  const slug = useParams()?.slug as string | undefined
  const edited =
    comment.updatedAt !== comment.createdAt
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        mb: 0.5,
      }}
    >
      <Typography variant="body2" fontWeight={600}>
        {slug ? (
          <Link component={NextLink} color="inherit" underline="hover"
            href={`/site/${slug}/users/${comment.username}`}
            data-testid="comment-author-link">
            {comment.username}
          </Link>
        ) : comment.username}
      </Typography>
      <Typography
        variant="caption"
        color="text.secondary"
      >
        {timeAgo(comment.createdAt)}
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
