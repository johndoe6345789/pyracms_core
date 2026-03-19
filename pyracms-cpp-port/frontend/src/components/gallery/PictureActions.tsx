import { Box, Button } from '@mui/material'
import {
  WallpaperOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@mui/icons-material'

export default function PictureActions() {
  return (
    <Box sx={{ display: 'flex', gap: 1 }}>
      <Button variant="outlined" startIcon={<WallpaperOutlined />} size="small">
        Set as Cover
      </Button>
      <Button variant="outlined" startIcon={<EditOutlined />} size="small">
        Edit
      </Button>
      <Button variant="outlined" color="error" startIcon={<DeleteOutlined />} size="small">
        Delete
      </Button>
    </Box>
  )
}
