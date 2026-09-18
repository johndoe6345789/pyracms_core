'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTenantId } from '@/hooks/useTenantId'
import {
  fetchSearch, SEARCH_ITEMS_PER_PAGE, type SearchResult,
} from './searchTypes'

export { SEARCH_ITEMS_PER_PAGE }
export type { SearchResult }

export function useSearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialQuery = searchParams.get('q') ?? ''
  const siteSlug = searchParams.get('site') ?? ''
  const tenantParam = searchParams.get('tenant_id') ?? ''
  const { tenantId: siteTenantId } = useTenantId(siteSlug)
  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState<SearchResult[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [facets, setFacets] = useState<Record<string, number>>({})
  const [activeType, setActiveType] = useState('all')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)

  const performSearch = useCallback(async (
    q: string,
    type: string,
    pg: number,
  ) => {
    if (!q) {
      setResults([])
      setTotalCount(0)
      setFacets({})
      return
    }
    setLoading(true)
    try {
      const tenantId = tenantParam
        || (siteTenantId ? String(siteTenantId) : '1')
      const data = await fetchSearch(q, tenantId, type, pg)
      setResults(data.items)
      setTotalCount(data.totalCount)
      setFacets(data.facets)
    } catch {
      setResults([])
    }
    setLoading(false)
  }, [siteTenantId, tenantParam])

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery, activeType, page)
    }
  }, [initialQuery, activeType, page, performSearch])

  const handleSearch = (q: string) => {
    setQuery(q)
    setPage(1)
    performSearch(q, activeType, 1)
    router.push(`/search?${new URLSearchParams({
      ...(siteSlug ? { site: siteSlug } : {}),
      ...(tenantParam ? { tenant_id: tenantParam } : {}),
      q,
    }).toString()}`)
  }

  const handleTypeChange = (type: string) => {
    setActiveType(type)
    setPage(1)
    performSearch(query, type, 1)
  }

  return {
    activeType, facets, handleSearch, handleTypeChange, loading,
    page, query, results, router, setPage, totalCount,
  }
}
