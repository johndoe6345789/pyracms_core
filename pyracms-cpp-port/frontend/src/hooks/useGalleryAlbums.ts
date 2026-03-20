'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'

export interface GalleryAlbum {
  id: string
  name: string
  coverImage: string
  pictureCount: number
}

export function useGalleryAlbums(tenantId: number | null) {
  const [albums, setAlbums] = useState<GalleryAlbum[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!tenantId) return
    setLoading(true)
    api.get(`/api/gallery/albums?tenant_id=${tenantId}`)
      .then(res => {
        const mapped: GalleryAlbum[] = (res.data || []).map((a: Record<string, unknown>) => ({
          id: String(a.id),
          name: a.displayName || a.name || '',
          coverImage: a.defaultPictureUrl || `https://picsum.photos/seed/album${a.id}/400/300`,
          pictureCount: a.pictureCount || 0,
        }))
        setAlbums(mapped)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [tenantId])

  return { albums, loading }
}
