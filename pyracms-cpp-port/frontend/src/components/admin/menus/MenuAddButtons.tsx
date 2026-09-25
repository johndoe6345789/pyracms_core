import { Box, Button } from '@mui/material'
import { CreateNewFolderOutlined, LinkOutlined } from '@mui/icons-material'

export default function MenuAddButtons(p: {
  onLink: () => void
  onFolder: () => void
}) {
  return (
    <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
      <Button
        variant="contained"
        startIcon={<LinkOutlined />}
        onClick={p.onLink}
        data-testid="add-link-btn"
      >
        Add link
      </Button>
      <Button
        variant="outlined"
        startIcon={<CreateNewFolderOutlined />}
        onClick={p.onFolder}
        data-testid="add-folder-btn"
      >
        Add folder
      </Button>
    </Box>
  )
}
