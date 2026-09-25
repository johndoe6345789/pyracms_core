import Link from 'next/link'
import { Box, Typography } from '@mui/material'
import type { FeaturedPhoto } from '@/hooks/useFeaturedPhoto'

/** The gallery's headline: a random photo (new one each visit). */
export default function GalleryHero({
  photo,
  slug,
}: {
  photo: FeaturedPhoto
  slug: string
}) {
  return (
    <Box
      component={Link}
      href={`/site/${slug}/gallery/picture/${photo.id}`}
      data-testid="gallery-hero"
      aria-label={`Featured photo: ${photo.title}`}
      sx={{
        display: 'block',
        position: 'relative',
        height: { xs: 220, md: 380 },
        mb: 4,
        borderRadius: 2,
        overflow: 'hidden',
        backgroundImage: `url("${photo.src}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: 'common.white',
        textDecoration: 'none',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          insetInline: 0,
          bottom: 0,
          p: 2,
          background: 'linear-gradient(transparent, rgba(0,0,0,0.65))',
        }}
      >
        <Typography variant="h5" component="p">
          {photo.title}
        </Typography>
        <Typography variant="body2">From {photo.albumName}</Typography>
      </Box>
    </Box>
  )
}
