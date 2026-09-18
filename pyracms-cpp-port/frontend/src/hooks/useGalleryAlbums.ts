'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'

export interface GalleryAlbum {
  id: string
  name: string
  coverImage: string
  pictureCount: number
}

const mapAlbum = (a: Record<string, unknown>): GalleryAlbum => ({
  id: String(a.id),
  name: (a.displayName || a.name || '') as string,
  coverImage: (a.defaultPictureUrl
    || `https://picsum.photos/seed/album${a.id}/400/300`) as string,
  pictureCount: (a.pictureCount || 0) as number,
})

export function useGalleryAlbums(tenantId: number | null) {
  const [albums, setAlbums] = useState<GalleryAlbum[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!tenantId) return
    setLoading(true)
    api.get(`/api/gallery/albums?tenant_id=${tenantId}`)
      .then(res => setAlbums((res.data || []).map(mapAlbum)))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [tenantId])

  return { albums, loading }
}
