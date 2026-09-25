import { Box, Button } from '@mui/material'
import {
  DeleteOutlined,
  EditOutlined,
  WallpaperOutlined,
} from '@mui/icons-material'

interface Props {
  id: string
  isCover: boolean
  disabled: boolean
  onSetCover: () => void
  onEdit: () => void
  onDelete: () => void
}

export default function AlbumPhotoActions({
  id,
  isCover,
  disabled,
  onSetCover,
  onEdit,
  onDelete,
}: Props) {
  return (
    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
      <Button
        size="small"
        variant="outlined"
        startIcon={<WallpaperOutlined />}
        disabled={disabled || isCover}
        onClick={onSetCover}
        data-testid={`set-cover-${id}`}
      >
        Set as cover
      </Button>
      <Button
        size="small"
        variant="outlined"
        startIcon={<EditOutlined />}
        disabled={disabled}
        onClick={onEdit}
        data-testid={`edit-photo-${id}`}
      >
        Edit
      </Button>
      <Button
        size="small"
        variant="outlined"
        color="error"
        startIcon={<DeleteOutlined />}
        disabled={disabled}
        onClick={onDelete}
        data-testid={`delete-photo-${id}`}
      >
        Delete
      </Button>
    </Box>
  )
}
