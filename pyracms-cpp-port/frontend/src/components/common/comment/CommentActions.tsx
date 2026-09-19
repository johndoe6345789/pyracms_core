'use client'

import { Box, Typography, IconButton, Button } from '@mui/material'
import {
  ThumbUpOutlined,
  ThumbDownOutlined,
  ReplyOutlined,
} from '@mui/icons-material'
import type { Comment } from './types'
import CommentOwnerButtons from './CommentOwnerButtons'

interface Props {
  comment: Comment
  isAuthenticated: boolean
  isOwner: boolean
  depth: number
  onVote: (isLike: boolean) => void
  onReply: () => void
  onEdit: () => void
  onDelete: () => void
}

export default function CommentActions(p: Props) {
  const { likes, dislikes } = p.comment
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <IconButton
        size="small"
        disabled={!p.isAuthenticated}
        onClick={() => p.onVote(true)}
        aria-label="Upvote"
        data-testid="comment-upvote-btn"
      >
        <ThumbUpOutlined fontSize="small" />
      </IconButton>
      <Typography variant="caption" color="text.secondary">
        {likes}
      </Typography>
      <IconButton
        size="small"
        disabled={!p.isAuthenticated}
        onClick={() => p.onVote(false)}
        aria-label="Downvote"
        data-testid="comment-downvote-btn"
      >
        <ThumbDownOutlined fontSize="small" />
      </IconButton>
      <Typography
        variant="caption"
        color="text.secondary"
        data-testid="comment-dislikes"
      >
        {dislikes}
      </Typography>
      {p.isAuthenticated && p.depth < 4 && (
        <Button
          size="small"
          startIcon={<ReplyOutlined />}
          onClick={p.onReply}
          sx={{ ml: 1, textTransform: 'none' }}
          data-testid="comment-reply-btn"
        >
          Reply
        </Button>
      )}
      {p.isOwner && (
        <CommentOwnerButtons onEdit={p.onEdit} onDelete={p.onDelete} />
      )}
    </Box>
  )
}
