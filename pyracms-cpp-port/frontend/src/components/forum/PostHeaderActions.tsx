'use client'

import { Box, IconButton } from '@mui/material'
import {
  EditOutlined,
  DeleteOutlined,
  SaveOutlined,
  CloseOutlined,
} from '@mui/icons-material'

interface Props {
  editing: boolean
  onSave: () => void
  onCancelEdit: () => void
  onStartEdit: () => void
  onDelete: () => void
}

export function PostHeaderActions(p: Props) {
  return (
    <Box sx={{ display: 'flex', gap: 0.5 }}>
      {p.editing ? (
        <>
          <IconButton
            size="small"
            color="primary"
            onClick={p.onSave}
            aria-label="Save edit"
            data-testid="post-save-btn"
          >
            <SaveOutlined fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={p.onCancelEdit}
            aria-label="Cancel edit"
            data-testid="post-cancel-edit-btn"
          >
            <CloseOutlined fontSize="small" />
          </IconButton>
        </>
      ) : (
        <>
          <IconButton
            size="small"
            color="primary"
            onClick={p.onStartEdit}
            aria-label="Edit post"
            data-testid="post-edit-btn"
          >
            <EditOutlined fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={p.onDelete}
            aria-label="Delete post"
            data-testid="post-delete-btn"
          >
            <DeleteOutlined fontSize="small" />
          </IconButton>
        </>
      )}
    </Box>
  )
}
