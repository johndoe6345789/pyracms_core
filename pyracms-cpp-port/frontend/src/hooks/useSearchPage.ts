'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTenantId } from '@/hooks/useTenantId'
import { SEARCH_ITEMS_PER_PAGE, type SearchResult } from './searchTypes'
import { useSearchRun } from './useSearchRun'

export { SEARCH_ITEMS_PER_PAGE }
export type { SearchResult }

export function useSearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialQuery = searchParams.get('q') ?? ''
  const siteSlug = searchParams.get('site') ?? ''
  const tenantParam = searchParams.get('tenant_id') ?? ''
  const { tenantId: siteTenantId } = useTenantId(siteSlug)
  // Search is per site: no fixed default tenant is ever assumed
  const tenantId = tenantParam || (siteTenantId ? String(siteTenantId) : '')
  const [query, setQuery] = useState(initialQuery)
  const [activeType, setActiveType] = useState('all')
  const [page, setPage] = useState(1)
  const { results, totalCount, facets, loading, performSearch } =
    useSearchRun(tenantId)

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery, activeType, page)
    }
  }, [initialQuery, activeType, page, performSearch])

  const handleSearch = (q: string) => {
    setQuery(q)
    setPage(1)
    performSearch(q, activeType, 1)
    router.push(
      `/search?${new URLSearchParams({
        ...(siteSlug ? { site: siteSlug } : {}),
        ...(tenantParam ? { tenant_id: tenantParam } : {}),
        q,
      }).toString()}`,
    )
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
    tenantId,
    totalCount,
  }
}
