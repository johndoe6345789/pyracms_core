'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'

export interface CodeAlbum {
  id: string
  name: string
  description: string
  snippetCount: number
}

export function useCodeAlbums(tenantId: number | null) {
  const [albums, setAlbums] = useState<CodeAlbum[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!tenantId) return
    setLoading(true)
    api.get(`/api/snippets?tenant_id=${tenantId}`)
      .then(res => {
        const items = res.data.items || res.data || []
        // Group by language to form albums
        const byLang: Record<string, number> = {}
        for (const s of items) {
          const lang = s.language || 'other'
          byLang[lang] = (byLang[lang] || 0) + 1
        }
        const mapped: CodeAlbum[] = Object.entries(byLang).map(([lang, count]) => ({
          id: lang,
          name: `${lang.charAt(0).toUpperCase() + lang.slice(1)} Snippets`,
          description: `Code snippets written in ${lang}.`,
          snippetCount: count,
        }))
        setAlbums(mapped)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [tenantId])

  return { albums, loading }
}
