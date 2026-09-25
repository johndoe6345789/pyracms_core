'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { Alert, Container, Typography } from '@mui/material'
import AlbumCoverMode from '@/components/gallery/AlbumCoverMode'
import AlbumDetailsForm from '@/components/gallery/AlbumDetailsForm'
import AlbumPhotoList from '@/components/gallery/AlbumPhotoList'
import BackToAlbumButton from '@/components/gallery/BackToAlbumButton'
import { ErrorAlert } from '@/components/common/ErrorAlert'
import { useAlbumEdit, type AlbumDetails } from '@/hooks/useAlbumEdit'
import { useCanManage } from '@/hooks/useCanManage'
import { useGalleryAlbum } from '@/hooks/useGalleryAlbum'

export default function EditAlbumPage() {
  const params = useParams()
  const slug = params.slug as string
  const albumId = params.albumId as string
  const album = useGalleryAlbum(albumId)
  const canManage = useCanManage(slug, album.ownerId)
  const edit = useAlbumEdit(albumId, album.refresh)
  const [draft, setDraft] = useState<AlbumDetails | null>(null)
  const saved: AlbumDetails = {
    name: album.albumName,
    description: album.albumDescription,
    isPrivate: album.options.isPrivate,
    sortOrder: album.options.sortOrder,
  }
  const details = draft ?? saved

  return (
    <Container maxWidth="md" sx={{ py: 6 }} data-testid="album-edit-page">
      <BackToAlbumButton href={`/site/${slug}/gallery/${albumId}`} />
      <Typography variant="h3" component="h1" gutterBottom>
        Edit album
      </Typography>
      {!canManage ? (
        <Alert severity="info">
          Only the album&apos;s owner or a site admin can edit it.
        </Alert>
      ) : (
        <>
          <ErrorAlert error={edit.error} testId="album-edit-error" />
          {edit.saved && !edit.error && (
            <Alert severity="success" sx={{ mb: 2 }} data-testid="album-saved">
              Saved.
            </Alert>
          )}
          <AlbumDetailsForm
            value={details}
            busy={edit.busy}
            onChange={setDraft}
            onSave={() => edit.saveDetails(details).then(() => setDraft(null))}
          />
          <AlbumCoverMode
            mode={album.options.coverMode}
            hasChosen={album.options.coverPictureId > 0}
            disabled={edit.busy}
            onChange={(mode) => edit.setCoverMode(saved, mode)}
          />
          <AlbumPhotoList
            pictures={album.pictures}
            coverId={album.options.coverPictureId}
            edit={edit}
          />
        </>
      )}
    </Container>
  )
}
