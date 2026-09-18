'use client'

import { useParams, useRouter } from 'next/navigation'
import { Container, Button, Divider } from '@mui/material'
import Link from 'next/link'
import { ArrowBackOutlined } from '@mui/icons-material'
import PictureViewer from '@/components/gallery/PictureViewer'
import PictureFooter from '@/components/gallery/PictureFooter'
import PictureInfo from '@/components/gallery/PictureInfo'
import GalleryBreadcrumbs
  from '@/components/gallery/GalleryBreadcrumbs'
import { useGalleryPicture } from '@/hooks/useGalleryPicture'

export default function PictureViewPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const pictureId = params.pictureId as string
  const {
    picture, handleLike, handleDislike, handleSetCover, handleDelete,
  } = useGalleryPicture(pictureId)

  if (!picture) return null

  const albumUrl = `/site/${slug}/gallery/${picture.albumId}`

  return (
    <Container
      maxWidth="lg"
      sx={{ py: 6 }}
      data-testid="picture-view-page"
    >
      <GalleryBreadcrumbs
        slug={slug}
        label="Picture breadcrumb"
        testId="picture-breadcrumbs"
        current={picture.title}
        albumName={picture.albumName}
        albumUrl={albumUrl}
      />

      <Button
        component={Link}
        href={albumUrl}
        startIcon={<ArrowBackOutlined />}
        sx={{ mb: 3, color: 'text.secondary' }}
        data-testid="back-to-album-btn"
        aria-label="Back to album"
      >
        Back to album
      </Button>

      <PictureViewer
        src={picture.src}
        title={picture.title}
        isVideo={picture.isVideo}
      />
      <PictureInfo
        title={picture.title}
        description={picture.description}
        tags={picture.tags}
      />
      <Divider sx={{ mb: 3 }} />
      <PictureFooter
        likes={picture.likes}
        dislikes={picture.dislikes}
        onLike={handleLike}
        onDislike={handleDislike}
        onSetCover={() => handleSetCover().catch(() => {})}
        onDelete={() =>
          handleDelete()
            .then(() => router.push(albumUrl))
            .catch(() => {})}
      />
    </Container>
  )
}
