'use client'

import { Box, Typography, CircularProgress } from '@mui/material'
import type { Comment } from './types'
import CommentItem from './CommentItem'

interface CommentListProps {
  comments: Comment[]
  loading: boolean
  contentType: string
  contentId: number
  onRefresh: () => void
}

export default function CommentList({
  comments,
  loading,
  contentType,
  contentId,
  onRefresh,
}: CommentListProps) {
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          p: 4,
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  if (comments.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">
          No comments yet. Be the first!
        </Typography>
      </Box>
    )
  }

  return (
    <>
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          contentType={contentType}
          contentId={contentId}
          depth={0}
          onRefresh={onRefresh}
        />
      ))}
    </>
  )
}
