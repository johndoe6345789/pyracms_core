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

interface ArticleVoteButtonsProps {
  likes: number
  dislikes: number
  onVote?: (isLike: boolean) => void
}

export function ArticleVoteButtons(
  {
    likes,
    dislikes,
    onVote,
  }: ArticleVoteButtonsProps
) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
      }}
      data-testid="article-vote-buttons"
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
        }}
      >
        <IconButton
          color="primary"
          size="small"
          onClick={
            () => onVote?.(true)
          }
          aria-label="Like article"
          data-testid="like-btn"
        >
          <ThumbUpOutlined />
        </IconButton>
        <Typography
          variant="body2"
          sx={{ fontWeight: 600 }}
          data-testid="like-count"
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
          color="default"
          size="small"
          onClick={
            () => onVote?.(false)
          }
          aria-label="Dislike article"
          data-testid="dislike-btn"
        >
          <ThumbDownOutlined />
        </IconButton>
        <Typography
          variant="body2"
          sx={{ fontWeight: 600 }}
          data-testid="dislike-count"
        >
          {dislikes}
        </Typography>
      </Box>
    </Box>
  )
}
