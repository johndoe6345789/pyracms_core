'use client'

import { useState, useEffect, useCallback } from 'react'
import api from '@/lib/api'
import { galleryFileUrl } from '@/lib/galleryImage'

export interface GalleryPicture {
  id: string
  title: string
  src: string
  cols: number
  rows: number
}

type Raw = Record<string, unknown>

const mapPicture = (p: Raw, i: number): GalleryPicture => ({
  id: String(p.id),
  title: (p.displayName || p.title) as string || `Photo ${i + 1}`,
  src: (p.url || p.thumbnailUrl
    || galleryFileUrl(p.fileUuid, true)) as string,
  cols: i % 5 === 0 ? 2 : 1,
  rows: i % 7 === 0 ? 2 : 1,
})

export function useGalleryAlbum(albumId: string) {
  const [albumName, setAlbumName] = useState('')
  const [albumDescription, setDescription] = useState('')
  const [ownerId, setOwnerId] = useState<number | null>(null)
  const [pictures, setPictures] = useState<GalleryPicture[]>([])
  const [loading, setLoading] = useState(true)
  const [tick, setTick] = useState(0)
  const refresh = useCallback(() => setTick((t) => t + 1), [])

  useEffect(() => {
    if (!albumId) return
    setLoading(true)
    api.get(`/api/gallery/albums/${albumId}`)
      .then(res => {
        const data = res.data
        setAlbumName(data.displayName || data.name || '')
        setDescription(data.description || '')
        setOwnerId(typeof data.userId === 'number' ? data.userId : null)
        setPictures((data.pictures || []).map(mapPicture))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [albumId, tick])

  return {
    albumName, albumDescription, ownerId, pictures, loading, refresh,
  }
}
