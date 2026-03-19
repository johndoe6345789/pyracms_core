'use client'

import { useParams } from 'next/navigation'
import { Container, Typography, Box, Button } from '@mui/material'
import { AddPhotoAlternateOutlined } from '@mui/icons-material'
import AlbumGrid from '@/components/gallery/AlbumGrid'
import { useGalleryAlbums } from '@/hooks/useGalleryAlbums'

export default function GalleryPage() {
  const params = useParams()
  const slug = params.slug as string
  const { albums } = useGalleryAlbums()

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
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
            Gallery
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Browse photo albums and collections.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddPhotoAlternateOutlined />}
          size="large"
        >
          Create Album
        </Button>
      </Box>
      <AlbumGrid albums={albums} slug={slug} />
    </Container>
  )
}
