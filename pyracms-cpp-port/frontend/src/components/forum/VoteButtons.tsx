'use client'

import { Box } from '@mui/material'
import { ThumbUpOutlined, ThumbDownOutlined } from '@mui/icons-material'
import { VoteButton } from './VoteButton'

interface VoteButtonsProps {
  likes: number
  dislikes: number
  onVote?: (isLike: boolean) => void
  disabled?: boolean
}

export function VoteButtons(
  { likes, dislikes, onVote, disabled }: VoteButtonsProps,
) {
  return (
    <Box
      sx={{ display: 'flex', alignItems: 'center', gap: 2 }}
      data-testid="vote-buttons"
    >
      <VoteButton
        label="Like" testId="like" count={likes} color="primary"
        icon={<ThumbUpOutlined fontSize="small" />}
        disabled={disabled ?? false}
        onClick={() => onVote?.(true)}
      />
      <VoteButton
        label="Dislike" testId="dislike" count={dislikes} color="default"
        icon={<ThumbDownOutlined fontSize="small" />}
        disabled={disabled ?? false}
        onClick={() => onVote?.(false)}
      />
    </Box>
  )
}
