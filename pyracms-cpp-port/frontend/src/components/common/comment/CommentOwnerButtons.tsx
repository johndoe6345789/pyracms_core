'use client'

import { IconButton } from '@mui/material'
import { EditOutlined, DeleteOutlined } from '@mui/icons-material'

interface Props {
  onEdit: () => void
  onDelete: () => void
}

export default function CommentOwnerButtons({ onEdit, onDelete }: Props) {
  return (
    <>
      <IconButton
        size="small"
        onClick={onEdit}
        aria-label="Edit comment"
        data-testid="comment-edit-btn"
      >
        <EditOutlined fontSize="small" />
      </IconButton>
      <IconButton
        size="small"
        onClick={onDelete}
        aria-label="Delete comment"
        data-testid="comment-delete-btn"
      >
        <DeleteOutlined fontSize="small" />
      </IconButton>
    </>
  )
}
