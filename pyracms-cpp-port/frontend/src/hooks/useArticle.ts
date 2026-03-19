'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'

export interface Article {
  title: string
  content: string
  author: string
  createdDate: string
  renderer: string
  views: number
  likes: number
  dislikes: number
  tags: string[]
  revisionNumber: number
}

export function useArticle(name: string, tenantId: number | null) {
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!name || !tenantId) return
    setLoading(true)
    api.get(`/api/articles/${name}?tenant_id=${tenantId}`)
      .then(res => {
        const a = res.data
        setArticle({
          title: a.displayName || a.name,
          content: a.content || '',
          author: a.authorUsername || 'Unknown',
          createdDate: a.createdAt?.split('T')[0] || '',
          renderer: a.rendererName || 'html',
          views: a.viewCount || 0,
          likes: a.likes || 0,
          dislikes: a.dislikes || 0,
          tags: a.tags || [],
          revisionNumber: a.revisionNumber || 1,
        })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [name, tenantId])

  const handleVote = (isLike: boolean) => {
    if (!tenantId) return
    api.post(`/api/articles/${name}/vote`, { like: isLike })
      .then(() => {
        setArticle(prev => prev ? {
          ...prev,
          likes: prev.likes + (isLike ? 1 : 0),
          dislikes: prev.dislikes + (isLike ? 0 : 1),
        } : prev)
      })
      .catch(() => {})
  }

  return { article, loading, handleVote }
}
