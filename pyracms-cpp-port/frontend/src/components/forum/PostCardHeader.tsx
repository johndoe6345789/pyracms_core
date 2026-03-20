'use client'

import {
  Box, Typography, Avatar, IconButton,
} from '@mui/material'
import {
  EditOutlined, DeleteOutlined,
  SaveOutlined, CloseOutlined,
} from '@mui/icons-material'

interface PostCardHeaderProps {
  author: string
  date: string
  isOwner: boolean
  editing: boolean
  onSave: () => void
  onCancelEdit: () => void
  onStartEdit: () => void
  onDelete: () => void
}

export function PostCardHeader({
  author, date, isOwner, editing,
  onSave, onCancelEdit, onStartEdit, onDelete,
}: PostCardHeaderProps) {
  return (
    <Box sx={{
      display: 'flex', mb: 2,
      justifyContent: 'space-between',
      alignItems: 'center',
    }}>
      <Box sx={{
        display: 'flex',
        alignItems: 'center', gap: 1.5,
      }}>
        <Avatar sx={{
          width: 36, height: 36,
          bgcolor: 'primary.main',
        }}>{author.charAt(0)}</Avatar>
        <Box>
          <Typography variant="subtitle2"
            sx={{ fontWeight: 600 }}
          >{author}</Typography>
          <Typography variant="caption"
            color="text.secondary"
          >{date}</Typography>
        </Box>
      </Box>
      {isOwner && (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {editing ? (<>
            <IconButton size="small"
              color="primary" onClick={onSave}
              aria-label="Save edit"
              data-testid="post-save-btn"
            ><SaveOutlined
              fontSize="small" /></IconButton>
            <IconButton size="small"
              onClick={onCancelEdit}
              aria-label="Cancel edit"
              data-testid="post-cancel-edit-btn"
            ><CloseOutlined
              fontSize="small" /></IconButton>
          </>) : (<>
            <IconButton size="small"
              color="primary"
              onClick={onStartEdit}
              aria-label="Edit post"
              data-testid="post-edit-btn"
            ><EditOutlined
              fontSize="small" /></IconButton>
            <IconButton size="small"
              color="error" onClick={onDelete}
              aria-label="Delete post"
              data-testid="post-delete-btn"
            ><DeleteOutlined
              fontSize="small" /></IconButton>
          </>)}
        </Box>
      )}
    </Box>
  )
}
