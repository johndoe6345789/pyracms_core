'use client'

import { useParams } from 'next/navigation'
import {
  Container,
  Typography,
  Box,
  Button,
  Breadcrumbs,
} from '@mui/material'
import Link from 'next/link'
import {
  UploadOutlined,
  NavigateNextOutlined,
} from '@mui/icons-material'
import PictureGrid
  from '@/components/gallery/PictureGrid'
import {
  useGalleryAlbum,
} from '@/hooks/useGalleryAlbum'

export default function AlbumViewPage() {
  const params = useParams()
  const slug = params.slug as string
  const albumId = params.albumId as string
  const {
    albumName,
    pictures,
  } = useGalleryAlbum(albumId)

  return (
    <Container
      maxWidth="lg"
      sx={{ py: 6 }}
      data-testid="album-view-page"
    >
      <Breadcrumbs
        separator={
          <NavigateNextOutlined
            fontSize="small"
          />
        }
        sx={{ mb: 3 }}
        aria-label="Gallery breadcrumb"
        data-testid="album-breadcrumbs"
      >
        <Link
          href={`/site/${slug}/gallery`}
          style={{
            color: 'inherit',
            textDecoration: 'none',
          }}
        >
          Gallery
        </Link>
        <Typography color="text.primary">
          {albumName}
        </Typography>
      </Breadcrumbs>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4,
        }}
      >
        <Box>
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
          >
            {albumName}
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
          >
            A curated collection of photographs.
            {' '}
            {pictures.length} pictures in this
            album.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<UploadOutlined />}
          size="large"
          component="label"
          data-testid="upload-picture-btn"
          aria-label="Upload pictures"
        >
          Upload
          <input
            type="file"
            hidden
            accept="image/*"
            multiple
            data-testid="upload-file-input"
            onChange={() => {
              // TODO: wire to gallery upload
              // API when picture upload
              // endpoint accepts file
            }}
          />
        </Button>
      </Box>

      <PictureGrid
        pictures={pictures}
        slug={slug}
      />
    </Container>
  )
}
