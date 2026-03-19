import { Box, Button } from '@mui/material'
import {
  WallpaperOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@mui/icons-material'

interface PictureActionsProps {
  onSetCover?: () => void
  onEdit?: () => void
  onDelete?: () => void
}

export default function PictureActions({ onSetCover, onEdit, onDelete }: PictureActionsProps) {
  return (
    <Box sx={{ display: 'flex', gap: 1 }}>
      <Button variant="outlined" startIcon={<WallpaperOutlined />} size="small" onClick={onSetCover}>
        Set as Cover
      </Button>
      <Button variant="outlined" startIcon={<EditOutlined />} size="small" onClick={onEdit}>
        Edit
      </Button>
      <Button variant="outlined" color="error" startIcon={<DeleteOutlined />} size="small" onClick={onDelete}>
        Delete
      </Button>
    </Box>
  )
}
