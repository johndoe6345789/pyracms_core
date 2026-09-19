'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'

export interface GalleryAlbum {
  id: string
  name: string
  /** '' when the album has no cover picture */
  coverImage: string
  ownerId: number | null
  pictureCount: number
}

const mapAlbum = (a: Record<string, unknown>): GalleryAlbum => ({
  id: String(a.id),
  name: (a.displayName || a.name || '') as string,
  coverImage: (a.defaultPictureUrl || '') as string,
  ownerId: typeof a.userId === 'number' ? a.userId : null,
  pictureCount: (a.pictureCount || 0) as number,
})

export function useGalleryAlbums(tenantId: number | null) {
  const [albums, setAlbums] = useState<GalleryAlbum[]>([])
  const [loading, setLoading] = useState(true)
  const [version, setVersion] = useState(0)

  useEffect(() => {
    if (!tenantId) return
    setLoading(true)
    api.get(`/api/gallery/albums?tenant_id=${tenantId}`)
      .then(res => setAlbums((res.data || []).map(mapAlbum)))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [tenantId, version])

  const refresh = () => setVersion((v) => v + 1)

  return { albums, loading, refresh }
}
