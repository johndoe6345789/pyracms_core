import { Box, Chip, ListItem, Typography } from '@mui/material'
import AlbumPhotoActions from './AlbumPhotoActions'
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
      <AlbumPhotoActions
        id={pic.id}
        isCover={p.isCover}
        disabled={p.disabled}
        onSetCover={p.onSetCover}
        onEdit={p.onEdit}
        onDelete={p.onDelete}
      />
    </ListItem>
  )
}
