'use client'

import { useParams, useRouter } from 'next/navigation'
import { Container, Button, Divider } from '@mui/material'
import Link from 'next/link'
import { ArrowBackOutlined } from '@mui/icons-material'
import PictureViewer from '@/components/gallery/PictureViewer'
import ManagedPictureFooter
  from '@/components/gallery/ManagedPictureFooter'
import PictureInfo from '@/components/gallery/PictureInfo'
import GalleryBreadcrumbs
  from '@/components/gallery/GalleryBreadcrumbs'
import { useGalleryPicture } from '@/hooks/useGalleryPicture'
import CommentSection from '@/components/common/CommentSection'
import { ErrorAlert } from '@/components/common/ErrorAlert'
import { useGuardedAction } from '@/components/gallery/useGuardedAction'

const VOTE_ERR = 'Failed to record vote'

export default function PictureViewPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const pictureId = params.pictureId as string
  const {
    picture, handleLike, handleDislike, handleSetCover, refresh,
  } = useGalleryPicture(pictureId)
  const { error, guard } = useGuardedAction()

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
      <ErrorAlert error={error} testId="picture-error" />
      <Divider sx={{ mb: 3 }} />
      <ManagedPictureFooter slug={slug} pictureId={pictureId}
        picture={picture} onLike={() => guard(handleLike, VOTE_ERR)}
        onDislike={() => guard(handleDislike, VOTE_ERR)}
        onSetCover={() => guard(handleSetCover, 'Failed to set cover')}
        onChanged={refresh} onDeleted={() => router.push(albumUrl)} />
      {Number.isInteger(Number(pictureId)) && (
        <CommentSection contentType="picture"
          contentId={Number(pictureId)} />
      )}
    </Container>
  )
}
