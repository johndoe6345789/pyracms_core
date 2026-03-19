'use client'

import { Box, IconButton, Typography } from '@mui/material'
import { ThumbUpOutlined, ThumbDownOutlined } from '@mui/icons-material'

interface VoteButtonsProps {
  likes: number
  dislikes: number
  onVote?: (isLike: boolean) => void
}

export function VoteButtons({ likes, dislikes, onVote }: VoteButtonsProps) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <IconButton size="small" color="primary" onClick={() => onVote?.(true)}>
          <ThumbUpOutlined fontSize="small" />
        </IconButton>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>{likes}</Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <IconButton size="small" color="default" onClick={() => onVote?.(false)}>
          <ThumbDownOutlined fontSize="small" />
        </IconButton>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>{dislikes}</Typography>
      </Box>
    </Box>
  )
}
