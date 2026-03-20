import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
} from '@mui/material'
import {
  CloudUploadOutlined,
} from '@mui/icons-material'

interface UploadDropzoneProps {
  dragOver: boolean
  onDragOver: (
    e: React.DragEvent,
  ) => void
  onDragLeave: () => void
  onDrop: (
    e: React.DragEvent,
  ) => void
}

export default function UploadDropzone({
  dragOver,
  onDragOver,
  onDragLeave,
  onDrop,
}: UploadDropzoneProps) {
  return (
    <Card
      variant="outlined"
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      role="region"
      aria-label="File upload dropzone"
      data-testid="upload-dropzone"
      sx={{
        borderColor: dragOver
          ? 'primary.main'
          : 'divider',
        borderStyle: 'dashed',
        borderWidth: 2,
        bgcolor: dragOver
          ? 'action.hover'
          : 'transparent',
        mb: 4,
        transition: 'all 0.2s',
      }}
    >
      <CardContent sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        py: 5,
      }}>
        <CloudUploadOutlined
          sx={{
            fontSize: 48,
            color: 'text.secondary',
            mb: 2,
          }}
        />
        <Typography
          variant="h5"
          sx={{ mb: 1 }}
        >
          Drag and drop files here
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mb: 2 }}
        >
          or click the button below
          to browse
        </Typography>
        <Button
          variant="contained"
          component="label"
          startIcon={
            <CloudUploadOutlined />
          }
          data-testid={
            'upload-files-btn'
          }
        >
          Upload Files
          <input
            type="file"
            hidden
            multiple
          />
        </Button>
      </CardContent>
    </Card>
  )
}
