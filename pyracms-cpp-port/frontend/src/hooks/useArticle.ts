'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'
import { formatDay } from './articleDate'

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
  revisionCount: number
  /** draft | published | scheduled */
  status?: string
  isPrivate?: boolean
}

function mapArticle(a: Record<string, any>): Article {
  return {
    title: a.displayName || a.name,
    content: a.content || '',
    author: a.authorUsername || 'Unknown',
    createdDate: formatDay(a.createdAt || ''),
    renderer: (a.rendererName || 'html').toLowerCase(),
    views: a.viewCount || 0,
    likes: a.likes || 0,
    dislikes: a.dislikes || 0,
    tags: a.tags || [],
    revisionCount: a.revisionCount || 0,
    status: a.status || 'published',
    isPrivate: Boolean(a.isPrivate),
  }
}

export function useArticle(
  name: string,
  tenantId: number | null
) {
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (!name || !tenantId) return
    setLoading(true)
    api.get(`/api/articles/${name}?tenant_id=${tenantId}`)
      .then((res) => setArticle(mapArticle(res.data)))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [name, tenantId, tick])

  const handleVote = (isLike: boolean) => {
    if (!tenantId) return
    api.post(`/api/articles/${name}/vote`, { like: isLike })
      .then(() => {
        setArticle((prev) => prev ? {
          ...prev,
          likes: prev.likes + (isLike ? 1 : 0),
          dislikes: prev.dislikes + (isLike ? 0 : 1),
        } : prev)
      })
      .catch(() => {})
  }

  const refresh = () => setTick((t) => t + 1)

  return { article, loading, handleVote, refresh }
}
