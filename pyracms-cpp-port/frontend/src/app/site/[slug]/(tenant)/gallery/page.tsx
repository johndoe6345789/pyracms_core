'use client'

import { useParams } from 'next/navigation'
import { Container } from '@mui/material'
import AlbumGrid from '@/components/gallery/AlbumGrid'
import CreateAlbumDialog from '@/components/gallery/CreateAlbumDialog'
import GalleryHeader from '@/components/gallery/GalleryHeader'
import { useCreateAlbum } from '@/hooks/useCreateAlbum'
import { useGalleryAlbums } from '@/hooks/useGalleryAlbums'
import { useSiteSession } from '@/hooks/useSiteSession'
import { useTenantId } from '@/hooks/useTenantId'

export default function GalleryPage() {
  const params = useParams()
  const slug = params.slug as string
  const { tenantId } = useTenantId(slug)
  const { albums, refresh } = useGalleryAlbums(tenantId)
  const signedIn = useSiteSession(slug)
  const create = useCreateAlbum(tenantId, refresh)

  return (
    <Container
      maxWidth="lg"
      sx={{ py: 6 }}
      data-testid="gallery-page"
    >
      <GalleryHeader
        canCreate={signedIn}
        onCreate={() => create.setOpen(true)}
      />
      <AlbumGrid albums={albums} slug={slug} />
      <CreateAlbumDialog s={create} />
    </Container>
  )
}
