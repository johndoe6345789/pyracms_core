'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Container, Divider, Snackbar } from '@mui/material'
import BackToAlbumButton from '@/components/gallery/BackToAlbumButton'
import PictureViewer from '@/components/gallery/PictureViewer'
import ManagedPictureFooter from '@/components/gallery/ManagedPictureFooter'
import PictureInfo from '@/components/gallery/PictureInfo'
import GalleryBreadcrumbs from '@/components/gallery/GalleryBreadcrumbs'
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
  const { picture, handleLike, handleDislike, handleSetCover, refresh } =
    useGalleryPicture(pictureId)
  const { error, guard } = useGuardedAction()
  const [notice, setNotice] = useState('')
  if (!picture) return null

  const albumUrl = `/site/${slug}/gallery/${picture.albumId}`
  return (
    <Container maxWidth="lg" sx={{ py: 6 }} data-testid="picture-view-page">
      <GalleryBreadcrumbs
        slug={slug}
        label="Picture breadcrumb"
        testId="picture-breadcrumbs"
        current={picture.title}
        albumName={picture.albumName}
        albumUrl={albumUrl}
      />
      <BackToAlbumButton href={albumUrl} />
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
      <ManagedPictureFooter
        slug={slug}
        pictureId={pictureId}
        picture={picture}
        onLike={() => guard(handleLike, VOTE_ERR)}
        onDislike={() => guard(handleDislike, VOTE_ERR)}
        onSetCover={() =>
          guard(async () => {
            await handleSetCover()
            setNotice('This picture is now the album cover')
          }, 'Failed to set cover')
        }
        onChanged={refresh}
        onDeleted={() => router.push(albumUrl)}
      />
      <Snackbar
        open={!!notice}
        autoHideDuration={3000}
        onClose={() => setNotice('')}
        message={notice}
        data-testid="cover-notice"
      />
      {Number.isInteger(Number(pictureId)) && (
        <CommentSection contentType="picture" contentId={Number(pictureId)} />
      )}
    </Container>
  )
}
