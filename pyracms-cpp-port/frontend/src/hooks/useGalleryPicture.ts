'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'

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
}

export function useGalleryPicture(pictureId: string) {
  const [picture, setPicture] = useState<PictureData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!pictureId) return
    setLoading(true)
    api.get(`/api/gallery/pictures/${pictureId}`)
      .then(res => {
        const p = res.data
        setPicture({
          title: p.title || '',
          description: p.description || '',
          src: p.url || `https://picsum.photos/seed/fullview/1200/800`,
          tags: p.tags || [],
          likes: p.likes || 0,
          dislikes: p.dislikes || 0,
          isVideo: p.isVideo || false,
          albumId: String(p.albumId || ''),
          albumName: p.albumName || '',
        })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [pictureId])

  const handleLike = () => {
    api.post(`/api/gallery/pictures/${pictureId}/vote`, { like: true })
      .then(() => {
        setPicture(prev => prev ? { ...prev, likes: prev.likes + 1 } : prev)
      })
      .catch(() => {})
  }

  const handleDislike = () => {
    api.post(`/api/gallery/pictures/${pictureId}/vote`, { like: false })
      .then(() => {
        setPicture(prev => prev ? { ...prev, dislikes: prev.dislikes + 1 } : prev)
      })
      .catch(() => {})
  }

  const handleSetCover = () => {
    return api.put(`/api/gallery/pictures/${pictureId}/default`)
  }

  const handleDelete = () => {
    return api.delete(`/api/gallery/pictures/${pictureId}`)
  }

  return { picture, loading, handleLike, handleDislike, handleSetCover, handleDelete }
}
