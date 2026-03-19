import {
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  Typography,
} from '@mui/material'
import Link from 'next/link'
import type { GalleryAlbum } from '@/hooks/useGalleryAlbums'

interface AlbumCardProps {
  album: GalleryAlbum
  slug: string
}

export default function AlbumCard({ album, slug }: AlbumCardProps) {
  return (
    <Card
      variant="outlined"
      sx={{
        height: '100%',
        borderColor: 'divider',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          borderColor: 'primary.main',
          boxShadow: 3,
          transform: 'translateY(-4px)',
        },
      }}
    >
      <CardActionArea
        component={Link}
        href={`/site/${slug}/gallery/${album.id}`}
      >
        <CardMedia
          component="img"
          height="200"
          image={album.coverImage}
          alt={album.name}
          sx={{ objectFit: 'cover' }}
        />
        <CardContent>
          <Typography variant="h5" component="h2" gutterBottom>
            {album.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {album.pictureCount} pictures
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}
