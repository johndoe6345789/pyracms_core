'use client'

import {
  Box,
  IconButton,
  Typography,
} from '@mui/material'
import {
  ThumbUpOutlined,
  ThumbDownOutlined,
} from '@mui/icons-material'

interface VoteButtonsProps {
  likes: number
  dislikes: number
  onVote?: (isLike: boolean) => void
}

export function VoteButtons(
  { likes, dislikes, onVote }:
  VoteButtonsProps,
) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
      }}
      data-testid="vote-buttons"
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
        }}
      >
        <IconButton
          size="small"
          color="primary"
          onClick={() => onVote?.(true)}
          aria-label="Like"
          data-testid="vote-like-button"
        >
          <ThumbUpOutlined
            fontSize="small"
          />
        </IconButton>
        <Typography
          variant="body2"
          sx={{ fontWeight: 600 }}
          data-testid="vote-like-count"
        >
          {likes}
        </Typography>
      </Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
        }}
      >
        <IconButton
          size="small"
          color="default"
          onClick={
            () => onVote?.(false)
          }
          aria-label="Dislike"
          data-testid={
            'vote-dislike-button'
          }
        >
          <ThumbDownOutlined
            fontSize="small"
          />
        </IconButton>
        <Typography
          variant="body2"
          sx={{ fontWeight: 600 }}
          data-testid={
            'vote-dislike-count'
          }
        >
          {dislikes}
        </Typography>
      </Box>
    </Box>
  )
}
