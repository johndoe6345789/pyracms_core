import { Button } from '@mui/material'
import { UploadOutlined } from '@mui/icons-material'

interface Props {
  uploading: boolean
  onFiles?: ((files: FileList) => void) | undefined
}

/** Label-button wrapping the hidden multi-file picker. */
export default function AlbumUploadButton({ uploading, onFiles }: Props) {
  return (
    <Button
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
    </Button>
  )
}
