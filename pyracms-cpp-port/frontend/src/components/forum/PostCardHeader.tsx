'use client'

import { Box, Typography, Avatar } from '@mui/material'
import { PostHeaderActions } from './PostHeaderActions'

interface PostCardHeaderProps {
  author: string
  date: string
  isOwner: boolean
  showAuthor?: boolean
  editing: boolean
  onSave: () => void
  onCancelEdit: () => void
  onStartEdit: () => void
  onDelete: () => void
}

export function PostCardHeader({
  author,
  date,
  isOwner,
  showAuthor = true,
  ...actions
}: PostCardHeaderProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        mb: 2,
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        {showAuthor && (
          <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main' }}>
            {author.charAt(0)}
          </Avatar>
        )}
        <Box>
          {showAuthor && (
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {author}
            </Typography>
          )}
          <Typography variant="caption" color="text.secondary">
            {date}
          </Typography>
        </Box>
      </Box>
      {isOwner && <PostHeaderActions {...actions} />}
    </Box>
  )
}
