'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'

export interface ArticleSummary {
  name: string
  title: string
  excerpt: string
  author: string
  date: string
  views: number
  tags: string[]
}

export function useArticles(tenantId: number | null) {
  const [searchQuery, setSearchQuery] = useState('')
  const [allArticles, setAllArticles] = useState<ArticleSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!tenantId) return
    setLoading(true)
    api.get(`/api/articles?tenant_id=${tenantId}`)
      .then(res => {
        const mapped: ArticleSummary[] = (res.data || []).map((a: Record<string, unknown>) => ({
          name: a.name,
          title: a.displayName,
          excerpt: typeof a.content === 'string' ? (a.content as string).replace(/<[^>]*>/g, '').substring(0, 120) + '...' : '',
          author: (a as Record<string, unknown>).authorUsername || 'Unknown',
          date: typeof a.createdAt === 'string' ? (a.createdAt as string).split('T')[0] : '',
          views: a.viewCount || 0,
          tags: Array.isArray(a.tags) ? a.tags : [],
        }))
        setAllArticles(mapped)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [tenantId])

  const articles = allArticles.filter(
    (a) =>
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return { articles, searchQuery, setSearchQuery, loading }
}
