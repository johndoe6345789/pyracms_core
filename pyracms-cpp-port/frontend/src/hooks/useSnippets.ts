'use client'

import { useState, useEffect, useMemo } from 'react'
import api from '@/lib/api'
import { mapSnippet, type Snippet } from '@/lib/snippets'

export function useSnippets(tenantId: number | null) {
  const [snippets, setSnippets] = useState<Snippet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [search, setSearch] = useState('')
  const [language, setLanguage] = useState('')
  const [sortBy, setSortBy] = useState('date')

  useEffect(() => {
    if (!tenantId) return
    setLoading(true)
    setError(false)
    // The API caps a page at 100, so walk the pages.
    const all: Snippet[] = []
    const page = async (offset: number): Promise<void> => {
      const res = await api.get(
        `/api/snippets?tenant_id=${tenantId}&limit=100&offset=${offset}`,
      )
      const items = res.data.items || []
      all.push(...items.map(mapSnippet))
      if (items.length === 100 && all.length < (res.data.total ?? 0))
        return page(offset + 100)
    }
    page(0)
      .then(() => setSnippets(all))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [tenantId])

  const languages = useMemo(
    () => [...new Set(snippets.map((s) => s.language))],
    [snippets],
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return snippets
      .filter(
        (s) =>
          (!q ||
            s.title.toLowerCase().includes(q) ||
            s.author.toLowerCase().includes(q) ||
            s.code.toLowerCase().includes(q)) &&
          (!language || s.language === language),
      )
      .sort((a, b) =>
        sortBy === 'popularity'
          ? b.runCount - a.runCount
          : b.date.localeCompare(a.date),
      )
  }, [snippets, search, language, sortBy])

  return {
    snippets: filtered,
    total: snippets.length,
    languages,
    loading,
    error,
    search,
    setSearch,
    language,
    setLanguage,
    sortBy,
    setSortBy,
  }
}
