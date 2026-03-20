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

export default function PictureActions(
  {
    onSetCover,
    onEdit,
    onDelete,
  }: PictureActionsProps,
) {
  return (
    <Box
      sx={{ display: 'flex', gap: 1 }}
      data-testid="picture-actions"
    >
      <Button
        variant="outlined"
        startIcon={
          <WallpaperOutlined />
        }
        size="small"
        onClick={onSetCover}
        data-testid="set-cover-btn"
        aria-label="Set as cover image"
      >
        Set as Cover
      </Button>
      <Button
        variant="outlined"
        startIcon={<EditOutlined />}
        size="small"
        onClick={onEdit}
        data-testid="edit-picture-btn"
        aria-label="Edit picture"
      >
        Edit
      </Button>
      <Button
        variant="outlined"
        color="error"
        startIcon={<DeleteOutlined />}
        size="small"
        onClick={onDelete}
        data-testid="delete-picture-btn"
        aria-label="Delete picture"
      >
        Delete
      </Button>
    </Box>
  )
}
