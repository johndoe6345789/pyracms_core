import { Box, ImageList, ImageListItem } from '@mui/material'
import Link from 'next/link'
import type { GalleryPicture } from '@/hooks/useGalleryAlbum'

interface PictureGridProps {
  pictures: GalleryPicture[]
  slug: string
}

export default function PictureGrid({ pictures, slug }: PictureGridProps) {
  return (
    <ImageList variant="masonry" cols={3} gap={16} data-testid="picture-grid">
      {pictures.map((pic) => (
        <ImageListItem
          key={pic.id}
          component={Link}
          href={`/site/${slug}/gallery/` + `picture/${pic.id}`}
          data-testid={`picture-item-${pic.id}`}
          sx={{
            borderRadius: 2,
            overflow: 'hidden',
            cursor: 'pointer',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              transform: 'scale(1.02)',
              boxShadow: 3,
            },
          }}
        >
          {!pic.src && (
            <Box
              data-testid={`picture-missing-${pic.id}`}
              sx={{
                height: 160,
                display: 'grid',
                placeItems: 'center',
                bgcolor: 'action.hover',
                color: 'text.secondary',
                p: 1,
              }}
            >
              {pic.title}
            </Box>
          )}
          {pic.src && (
            <img
              src={pic.src}
              alt={pic.title}
              loading="lazy"
              style={{
                display: 'block',
                width: '100%',
                borderRadius: 12,
              }}
            />
          )}
        </ImageListItem>
      ))}
    </ImageList>
  )
}
