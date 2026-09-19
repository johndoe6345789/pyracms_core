import { Typography, Box, Button } from '@mui/material'
import { UploadOutlined } from '@mui/icons-material'

interface Props {
  albumName: string
  count: number
  /** Hide the upload button (guests). Defaults to shown. */
  canUpload?: boolean
  uploading?: boolean
  onFiles?: (files: FileList) => void
}

export default function AlbumHeader(
  { albumName, count, canUpload = true, uploading = false, onFiles }: Props,
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
      {canUpload && <Button
        variant="contained"
        startIcon={<UploadOutlined />}
        size="large"
        component="label"
        data-testid="upload-picture-btn"
        aria-label="Upload pictures"
        disabled={uploading}
      >
        {uploading ? 'Uploading...' : 'Upload'}
        <input
          type="file"
          hidden
          accept="image/*"
          multiple
          data-testid="upload-file-input"
          onChange={(e) => {
            if (e.target.files?.length) onFiles?.(e.target.files)
            e.target.value = ''
          }}
        />
      </Button>}
    </Box>
  )
}
