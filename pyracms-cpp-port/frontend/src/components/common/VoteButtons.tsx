import { Box, IconButton, Typography } from '@mui/material'
import {
  ThumbUpOutlined,
  ThumbDownOutlined,
} from '@mui/icons-material'

interface VoteButtonsProps {
  likes: number
  dislikes: number
  onLike?: () => void
  onDislike?: () => void
}

export default function VoteButtons({
  likes,
  dislikes,
  onLike,
  onDislike,
}: VoteButtonsProps) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <IconButton color="primary" onClick={onLike}>
          <ThumbUpOutlined />
        </IconButton>
        <Typography variant="body2">{likes}</Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <IconButton color="default" onClick={onDislike}>
          <ThumbDownOutlined />
        </IconButton>
        <Typography variant="body2">{dislikes}</Typography>
      </Box>
    </Box>
  )
}
