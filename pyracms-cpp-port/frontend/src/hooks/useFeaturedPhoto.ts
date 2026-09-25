'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { galleryFileUrl } from '@/lib/galleryImage'

export interface FeaturedPhoto {
  id: string
  title: string
  albumName: string
  src: string
}

/** A random public photo of the site (GET /api/gallery/random), or null. */
export function useFeaturedPhoto(tenantId: number | null) {
  const [photo, setPhoto] = useState<FeaturedPhoto | null>(null)
  useEffect(() => {
    if (!tenantId) return
    api
      .get(`/api/gallery/random?tenant_id=${tenantId}`)
      .then((res) =>
        setPhoto({
          id: String(res.data.id),
          title: res.data.displayName || '',
          albumName: res.data.albumName || '',
          src: galleryFileUrl(res.data.fileUuid),
        }),
      )
      .catch(() => setPhoto(null))
  }, [tenantId])
  return photo
}
