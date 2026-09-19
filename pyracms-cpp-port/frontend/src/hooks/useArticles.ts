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

type Raw = Record<string, any>

export function mapSummary(a: Raw): ArticleSummary {
  const content =
    typeof a.content === 'string'
      ? a.content.replace(/<[^>]*>/g, '').substring(0, 120) + '...'
      : ''
  return {
    name: a.name,
    title: a.displayName ?? a.name ?? '',
    excerpt: content,
    author: a.authorUsername || 'Unknown',
    date:
      typeof a.createdAt === 'string' ? (a.createdAt.split('T')[0] ?? '') : '',
    views: a.viewCount || 0,
    tags: Array.isArray(a.tags) ? a.tags : [],
  }
}

export function useArticles(tenantId: number | null) {
  const [searchQuery, setSearchQuery] = useState('')
  const [allArticles, setAllArticles] = useState<ArticleSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!tenantId) return
    setLoading(true)
    api
      .get(`/api/articles?tenant_id=${tenantId}`)
      .then((res) => setAllArticles((res.data || []).map(mapSummary)))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [tenantId])

  const q = searchQuery.toLowerCase()
  const articles = allArticles.filter(
    (a) =>
      a.title.toLowerCase().includes(q) ||
      a.tags.some((t) => t.toLowerCase().includes(q)),
  )

  return { articles, searchQuery, setSearchQuery, loading }
}
