'use client'

import { useParams } from 'next/navigation'
import { Container } from '@mui/material'
import PictureGrid from '@/components/gallery/PictureGrid'
import AlbumHeader from '@/components/gallery/AlbumHeader'
import GalleryBreadcrumbs
  from '@/components/gallery/GalleryBreadcrumbs'
import { useGalleryAlbum } from '@/hooks/useGalleryAlbum'

export default function AlbumViewPage() {
  const params = useParams()
  const slug = params.slug as string
  const albumId = params.albumId as string
  const { albumName, pictures } = useGalleryAlbum(albumId)

  return (
    <Container
      maxWidth="lg"
      sx={{ py: 6 }}
      data-testid="album-view-page"
    >
      <GalleryBreadcrumbs
        slug={slug}
        label="Gallery breadcrumb"
        testId="album-breadcrumbs"
        current={albumName}
      />
      <AlbumHeader albumName={albumName} count={pictures.length} />
      <PictureGrid pictures={pictures} slug={slug} />
    </Container>
  )
}
