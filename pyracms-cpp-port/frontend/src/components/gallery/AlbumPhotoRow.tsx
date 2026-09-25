import { Box, Button, Chip, ListItem, Typography } from '@mui/material'
import {
  DeleteOutlined,
  EditOutlined,
  WallpaperOutlined,
} from '@mui/icons-material'
import type { GalleryPicture } from '@/hooks/useGalleryAlbum'

interface Props {
  picture: GalleryPicture
  isCover: boolean
  disabled: boolean
  onSetCover: () => void
  onEdit: () => void
  onDelete: () => void
}

/** One photo with its title, description and actions. */
export default function AlbumPhotoRow(p: Props) {
  const { picture: pic } = p
  return (
    <ListItem
      divider
      sx={{ gap: 2, alignItems: 'flex-start', flexWrap: 'wrap' }}
      data-testid={`photo-row-${pic.id}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={pic.src}
        alt=""
        loading="lazy"
        style={{ width: 96, height: 96, objectFit: 'cover', borderRadius: 4 }}
      />
      <Box sx={{ flex: 1, minWidth: 180 }}>
        <Typography fontWeight={600}>
          {pic.title}{' '}
          {p.isCover && (
            <Chip
              size="small"
              color="primary"
              label="Cover"
              data-testid={`cover-badge-${pic.id}`}
            />
          )}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {pic.description || 'No description'}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <Button
          size="small"
          variant="outlined"
          startIcon={<WallpaperOutlined />}
          disabled={p.disabled || p.isCover}
          onClick={p.onSetCover}
          data-testid={`set-cover-${pic.id}`}
        >
          Set as cover
        </Button>
        <Button
          size="small"
          variant="outlined"
          startIcon={<EditOutlined />}
          disabled={p.disabled}
          onClick={p.onEdit}
          data-testid={`edit-photo-${pic.id}`}
        >
          Edit
        </Button>
        <Button
          size="small"
          variant="outlined"
          color="error"
          startIcon={<DeleteOutlined />}
          disabled={p.disabled}
          onClick={p.onDelete}
          data-testid={`delete-photo-${pic.id}`}
        >
          Delete
        </Button>
      </Box>
    </ListItem>
  )
}
