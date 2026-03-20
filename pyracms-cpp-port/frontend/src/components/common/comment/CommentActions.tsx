'use client'

import {
  Box, Typography, IconButton, Button,
} from '@mui/material'
import {
  ThumbUpOutlined, ThumbUp,
  ThumbDownOutlined, ThumbDown,
  ReplyOutlined, EditOutlined,
  DeleteOutlined,
} from '@mui/icons-material'
import type { Comment } from './types'

interface Props {
  comment: Comment
  isAuthenticated: boolean
  isOwner: boolean
  depth: number
  onVote: (v: number) => void
  onReply: () => void
  onEdit: () => void
  onDelete: () => void
}

export default function CommentActions(
  p: Props
) {
  const score =
    p.comment.upvotes - p.comment.downvotes
  const up = p.comment.user_vote === 1
  const down = p.comment.user_vote === -1
  return (
    <Box sx={{
      display: 'flex',
      alignItems: 'center', gap: 0.5,
    }}>
      <IconButton
        size="small" disabled={!p.isAuthenticated}
        onClick={() => p.onVote(1)}
        aria-label="Upvote"
        data-testid="comment-upvote-btn"
      >
        {up
          ? <ThumbUp fontSize="small"
              color="primary" />
          : <ThumbUpOutlined
              fontSize="small" />}
      </IconButton>
      <Typography variant="caption"
        color="text.secondary">{score}
      </Typography>
      <IconButton
        size="small" disabled={!p.isAuthenticated}
        onClick={() => p.onVote(-1)}
        aria-label="Downvote"
        data-testid="comment-downvote-btn"
      >
        {down
          ? <ThumbDown fontSize="small"
              color="error" />
          : <ThumbDownOutlined
              fontSize="small" />}
      </IconButton>
      {p.isAuthenticated && p.depth < 4 && (
        <Button size="small"
          startIcon={<ReplyOutlined />}
          onClick={p.onReply}
          sx={{ ml: 1, textTransform: 'none' }}
          data-testid="comment-reply-btn"
        >Reply</Button>
      )}
      {p.isOwner && (<>
        <IconButton size="small"
          onClick={p.onEdit}
          aria-label="Edit comment"
          data-testid="comment-edit-btn"
        ><EditOutlined fontSize="small" />
        </IconButton>
        <IconButton size="small"
          onClick={p.onDelete}
          aria-label="Delete comment"
          data-testid="comment-delete-btn"
        ><DeleteOutlined fontSize="small" />
        </IconButton>
      </>)}
    </Box>
  )
}
