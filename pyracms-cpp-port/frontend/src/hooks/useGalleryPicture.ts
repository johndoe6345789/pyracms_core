'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'
import { galleryFileUrl } from '@/lib/galleryImage'

export interface PictureData {
  title: string
  description: string
  src: string
  tags: string[]
  likes: number
  dislikes: number
  isVideo: boolean
  albumId: string
  albumName: string
  ownerId: number | null
}

export function useGalleryPicture(pictureId: string) {
  const [picture, setPicture] = useState<PictureData | null>(null)
  const [loading, setLoading] = useState(true)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (!pictureId) return
    setLoading(true)
    api
      .get(`/api/gallery/pictures/${pictureId}`)
      .then((res) => {
        const p = res.data
        setPicture({
          title: p.displayName || p.title || '',
          description: p.description || '',
          src: p.url || galleryFileUrl(p.fileUuid),
          tags: p.tags || [],
          likes: p.likes || 0,
          dislikes: p.dislikes || 0,
          isVideo: p.isVideo || false,
          albumId: String(p.albumId || ''),
          albumName: p.albumName || '',
          ownerId: typeof p.userId === 'number' ? p.userId : null,
        })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [pictureId, tick])

  const vote = (like: boolean, key: 'likes' | 'dislikes') =>
    api.post(`/api/gallery/pictures/${pictureId}/vote`, { like }).then(() => {
      setPicture((prev) => (prev ? { ...prev, [key]: prev[key] + 1 } : prev))
    })

  const handleLike = () => vote(true, 'likes')
  const handleDislike = () => vote(false, 'dislikes')

  const handleSetCover = () =>
    api.put(`/api/gallery/pictures/${pictureId}/default`)

  return {
    picture,
    loading,
    handleLike,
    handleDislike,
    handleSetCover,
    refresh: () => setTick((t) => t + 1),
  }
}
