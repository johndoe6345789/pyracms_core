'use client'

import { Box, IconButton, Typography } from '@mui/material'
import { ThumbUpOutlined, ThumbDownOutlined } from '@mui/icons-material'

interface ArticleVoteButtonsProps {
  likes: number
  dislikes: number
  onVote?: (isLike: boolean) => void
}

export function ArticleVoteButtons({ likes, dislikes, onVote }: ArticleVoteButtonsProps) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <IconButton color="primary" size="small" onClick={() => onVote?.(true)}>
          <ThumbUpOutlined />
        </IconButton>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {likes}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <IconButton color="default" size="small" onClick={() => onVote?.(false)}>
          <ThumbDownOutlined />
        </IconButton>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {dislikes}
        </Typography>
      </Box>
    </Box>
  )
}
