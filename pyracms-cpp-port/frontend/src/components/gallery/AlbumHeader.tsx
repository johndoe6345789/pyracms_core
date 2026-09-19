import { Typography, Box, Button } from '@mui/material'
import AlbumUploadButton from './AlbumUploadButton'

interface Props {
  albumName: string
  count: number
  /** Hide the upload button (guests). Defaults to shown. */
  canUpload?: boolean
  uploading?: boolean
  onFiles?: (files: FileList) => void
  description?: string
  /** Owner/admin controls; omitted for everyone else */
  onEdit?: () => void
  onDelete?: () => void
}

export default function AlbumHeader({
  albumName,
  count,
  canUpload = true,
  uploading = false,
  onFiles,
  description,
  onEdit,
  onDelete,
}: Props) {
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
          {albumName}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {description ? `${description} - ` : ''}
          {count} pictures in this album.
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', gap: 1 }}>
        {onEdit && (
          <Button
            variant="outlined"
            onClick={onEdit}
            data-testid="edit-album-btn"
          >
            Edit
          </Button>
        )}
        {onDelete && (
          <Button
            variant="outlined"
            color="error"
            onClick={onDelete}
            data-testid="delete-album-btn"
          >
            Delete
          </Button>
        )}
        {canUpload && (
          <AlbumUploadButton uploading={uploading} onFiles={onFiles} />
        )}
      </Box>
    </Box>
  )
}
