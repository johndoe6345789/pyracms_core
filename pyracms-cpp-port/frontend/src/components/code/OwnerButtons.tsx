'use client'

import { Button } from '@mui/material'
import { EditOutlined, DeleteOutlined } from '@mui/icons-material'

interface Props {
  onEdit: () => void
  onDelete: () => void
}

export function OwnerButtons({ onEdit, onDelete }: Props) {
  return (
    <>
      <Button variant="outlined" startIcon={<EditOutlined />}
        onClick={onEdit} data-testid="edit-snippet-btn">
        Edit
      </Button>
      <Button variant="outlined" color="error"
        startIcon={<DeleteOutlined />}
        onClick={onDelete} data-testid="delete-snippet-btn">
        Delete
      </Button>
    </>
  )
}
