import { Typography, Box, Button } from '@mui/material'
import { UploadOutlined } from '@mui/icons-material'

export default function AlbumHeader(
  { albumName, count }: { albumName: string; count: number },
) {
  return (
    <Box sx={{
      display: 'flex', justifyContent: 'space-between',
      alignItems: 'center', mb: 4,
    }}>
      <Box>
        <Typography variant="h3" component="h1" gutterBottom>
          {albumName}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          A curated collection of photographs.
          {' '}
          {count} pictures in this album.
        </Typography>
      </Box>
      <Button
        variant="contained"
        startIcon={<UploadOutlined />}
        size="large"
        component="label"
        data-testid="upload-picture-btn"
        aria-label="Upload pictures"
      >
        Upload
        <input
          type="file"
          hidden
          accept="image/*"
          multiple
          data-testid="upload-file-input"
          onChange={() => {
            // TODO: wire to gallery upload API when the picture
            // upload endpoint accepts a file
          }}
        />
      </Button>
    </Box>
  )
}
