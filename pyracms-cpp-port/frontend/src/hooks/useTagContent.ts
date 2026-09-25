'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { mapSnippet, type Snippet } from '@/lib/snippets'

export interface TaggedArticle {
  name: string
  title: string
}

/** Everything on a site that carries one tag: its articles and snippets. */
export function useTagContent(tenantId: number | null, tag: string) {
  const [articles, setArticles] = useState<TaggedArticle[]>([])
  const [snippets, setSnippets] = useState<Snippet[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!tenantId || !tag) return
    const q = `tenant_id=${tenantId}&tag=${encodeURIComponent(tag)}&limit=100`
    setLoading(true)
    Promise.all([
      api.get(`/api/articles?${q}`).catch(() => ({ data: [] })),
      api.get(`/api/snippets?${q}`).catch(() => ({ data: {} })),
    ])
      .then(([a, s]) => {
        const rows: Record<string, unknown>[] = Array.isArray(a.data)
          ? a.data
          : a.data?.items || []
        setArticles(
          rows.map((r) => ({
            name: String(r.name ?? ''),
            title: String(r.displayName || r.name || ''),
          })),
        )
        setSnippets((s.data?.items || []).map(mapSnippet))
      })
      .finally(() => setLoading(false))
  }, [tenantId, tag])

  return { articles, snippets, loading }
}
