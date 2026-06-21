'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import api from '@/lib/api'
import { useTenantId } from '@/hooks/useTenantId'

export interface SearchResult {
  type: string
  id: number
  title: string
  snippet: string
  url: string
  rank: number
  createdAt: string
}

export const SEARCH_ITEMS_PER_PAGE = 10

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
      const params = new URLSearchParams({
        q,
        tenant_id: tenantId,
        type: type === 'all' ? '' : type,
        limit: String(SEARCH_ITEMS_PER_PAGE),
        offset: String((pg - 1) * SEARCH_ITEMS_PER_PAGE),
      })
      const res = await api.get(`/api/search?${params}`)
      setResults(res.data.items || [])
      setTotalCount(res.data.totalCount || 0)
      setFacets(res.data.facets || {})
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
    activeType,
    facets,
    handleSearch,
    handleTypeChange,
    loading,
    page,
    query,
    results,
    router,
    setPage,
    totalCount,
  }
}
