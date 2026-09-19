'use client'

import { useCallback, useState } from 'react'
import { fetchSearch, type SearchResult } from './searchTypes'

/** Runs searches for a tenant and holds the latest result state. */
export function useSearchRun(tenantId: string) {
  const [results, setResults] = useState<SearchResult[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [facets, setFacets] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(false)

  const performSearch = useCallback(
    async (q: string, type: string, pg: number) => {
      if (!q || !tenantId) {
        setResults([])
        setTotalCount(0)
        setFacets({})
        return
      }
      setLoading(true)
      try {
        const data = await fetchSearch(q, tenantId, type, pg)
        setResults(data.items)
        setTotalCount(data.totalCount)
        setFacets(data.facets)
      } catch {
        setResults([])
      }
      setLoading(false)
    },
    [tenantId],
  )

  return { results, totalCount, facets, loading, performSearch }
}
