import { Box, CardMedia } from '@mui/material'
import { PhotoLibraryOutlined } from '@mui/icons-material'

/** Cover image, or an honest empty tile when the album has none. */
export default function AlbumCover({
  src,
  name,
}: {
  src: string
  name: string
}) {
  if (!src) {
    return (
      <Box
        data-testid="album-no-cover"
        sx={{
          height: 200,
          display: 'grid',
          placeItems: 'center',
          bgcolor: 'action.hover',
          color: 'text.disabled',
        }}
      >
        <PhotoLibraryOutlined fontSize="large" />
      </Box>
    )
  }
  return (
    <CardMedia
      component="img"
      height="200"
      image={src}
      alt={`Cover image for album ${name}`}
      sx={{ objectFit: 'cover' }}
    />
  )
}
