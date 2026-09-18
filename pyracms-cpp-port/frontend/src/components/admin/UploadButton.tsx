import { Button } from '@mui/material'
import { CloudUploadOutlined } from '@mui/icons-material'

export default function UploadButton({
  onFilesSelected,
}: {
  onFilesSelected?: ((files: FileList) => void) | undefined
}) {
  return (
    <Button
      variant="contained"
      component="label"
      startIcon={<CloudUploadOutlined />}
      data-testid="upload-files-btn"
    >
      Upload Files
      <input
        type="file"
        hidden
        multiple
        data-testid="upload-file-input"
        onChange={(e) => {
          const files = e.target.files
          if (files && files.length > 0) {
            onFilesSelected?.(files)
          }
          e.target.value = ''
        }}
      />
    </Button>
  )
}
