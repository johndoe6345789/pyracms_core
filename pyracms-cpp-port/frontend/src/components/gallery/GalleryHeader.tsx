import { Typography, Box, Button } from '@mui/material'
import { AddPhotoAlternateOutlined } from '@mui/icons-material'

interface Props {
  canCreate: boolean
  onCreate: () => void
}

export default function GalleryHeader({ canCreate, onCreate }: Props) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 4,
      }}
    >
      <Box>
        <Typography variant="h3" component="h1" gutterBottom>
          Gallery
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Browse photo albums and collections.
        </Typography>
      </Box>
      {canCreate && (
        <Button
          variant="contained"
          startIcon={<AddPhotoAlternateOutlined />}
          size="large"
          onClick={onCreate}
          data-testid="create-album-btn"
          aria-label="Create album"
        >
          Create Album
        </Button>
      )}
    </Box>
  )
}
