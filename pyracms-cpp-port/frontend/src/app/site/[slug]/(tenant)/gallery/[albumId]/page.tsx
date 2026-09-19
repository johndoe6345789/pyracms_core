'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Alert, Container, Typography } from '@mui/material'
import PictureGrid from '@/components/gallery/PictureGrid'
import AlbumHeader from '@/components/gallery/AlbumHeader'
import GalleryBreadcrumbs from '@/components/gallery/GalleryBreadcrumbs'
import { useGalleryAlbum } from '@/hooks/useGalleryAlbum'
import { useAlbumUpload } from '@/hooks/useAlbumUpload'
import { useSiteSession } from '@/hooks/useSiteSession'
import { useCanManage } from '@/hooks/useCanManage'
import GalleryManageDialogs, {
  type ManageDialog,
} from '@/components/gallery/GalleryManageDialogs'
import { useTenantId } from '@/hooks/useTenantId'

export default function AlbumViewPage() {
  const params = useParams()
  const slug = params.slug as string
  const albumId = params.albumId as string
  const router = useRouter()
  const { albumName, albumDescription, ownerId, pictures, refresh } =
    useGalleryAlbum(albumId)
  const [dialog, setDialog] = useState<ManageDialog>(null)
  const canManage = useCanManage(slug, ownerId)
  const { tenantId } = useTenantId(slug)
  const signedIn = useSiteSession(slug)
  const up = useAlbumUpload(albumId, tenantId, refresh)

  return (
    <Container maxWidth="lg" sx={{ py: 6 }} data-testid="album-view-page">
      <GalleryBreadcrumbs
        slug={slug}
        label="Gallery breadcrumb"
        testId="album-breadcrumbs"
        current={albumName}
      />
      <AlbumHeader
        albumName={albumName}
        count={pictures.length}
        canUpload={signedIn}
        uploading={up.uploading}
        onFiles={up.upload}
        description={albumDescription}
        {...(canManage
          ? {
              onEdit: () => setDialog('edit'),
              onDelete: () => setDialog('delete'),
            }
          : {})}
      />
      <GalleryManageDialogs
        key={`${albumName}|${albumDescription}`}
        kind="albums"
        id={albumId}
        name={albumName}
        description={albumDescription}
        open={dialog}
        onClose={() => setDialog(null)}
        onChanged={refresh}
        onDeleted={() => router.push(`/site/${slug}/gallery`)}
      />
      {up.error && (
        <Alert severity="error" sx={{ mb: 2 }} data-testid="upload-error">
          {up.error}
        </Alert>
      )}
      {pictures.length === 0 && (
        <Typography color="text.secondary" data-testid="album-empty">
          {signedIn
            ? 'No pictures yet - use Upload to add the first one.'
            : 'No pictures in this album yet.'}
        </Typography>
      )}
      <PictureGrid pictures={pictures} slug={slug} />
    </Container>
  )
}
