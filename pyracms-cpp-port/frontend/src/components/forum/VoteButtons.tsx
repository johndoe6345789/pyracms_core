'use client'

import { Box, IconButton, Typography } from '@mui/material'
import { ThumbUpOutlined, ThumbDownOutlined } from '@mui/icons-material'

interface VoteButtonsProps {
  likes: number
  dislikes: number
}

export function VoteButtons({ likes, dislikes }: VoteButtonsProps) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <IconButton size="small" color="primary">
          <ThumbUpOutlined fontSize="small" />
        </IconButton>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>{likes}</Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <IconButton size="small" color="default">
          <ThumbDownOutlined fontSize="small" />
        </IconButton>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>{dislikes}</Typography>
      </Box>
    </Box>
  )
}
