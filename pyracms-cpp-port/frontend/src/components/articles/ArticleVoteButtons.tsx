'use client'

import { Box, IconButton, Typography } from '@mui/material'
import { ThumbUpOutlined, ThumbDownOutlined } from '@mui/icons-material'

interface ArticleVoteButtonsProps {
  likes: number
  dislikes: number
}

export function ArticleVoteButtons({ likes, dislikes }: ArticleVoteButtonsProps) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <IconButton color="primary" size="small">
          <ThumbUpOutlined />
        </IconButton>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {likes}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <IconButton color="default" size="small">
          <ThumbDownOutlined />
        </IconButton>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {dislikes}
        </Typography>
      </Box>
    </Box>
  )
}
