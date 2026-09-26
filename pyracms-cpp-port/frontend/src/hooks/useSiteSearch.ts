'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTenantId } from '@/hooks/useTenantId'
import { fetchSearch } from '@/lib/search/api'
import type { SearchPage } from '@/lib/search/types'
import { searchPagePath } from '@/lib/searchUrl'

/**
 * A site's search page. The address is the state (q, type, page), so the
 * back button, reloads and shared links all land on the same results.
 */
export function useSiteSearch(slug: string) {
  const params = useSearchParams()
  const router = useRouter()
  const q = (params.get('q') ?? '').trim()
  const type = params.get('type') || 'all'
  const page = Math.max(1, Number(params.get('page')) || 1)
  const { tenantId } = useTenantId(slug)
  const [data, setData] = useState<SearchPage | null>(null)
  const [loading, setLoading] = useState(false)
  const [failed, setFailed] = useState(false)
  const latest = useRef(0)

  useEffect(() => {
    if (!q || !tenantId) {
      setData(null)
      return
    }
    const mine = ++latest.current
    setLoading(true)
    setFailed(false)
    fetchSearch(slug, tenantId, q, type, page)
      .then((d) => mine === latest.current && setData(d))
      .catch(() => mine === latest.current && setFailed(true))
      .finally(() => mine === latest.current && setLoading(false))
  }, [slug, tenantId, q, type, page])

  const go = (o: { q?: string; type?: string; page?: number }) =>
    router.push(searchPagePath(slug, { q, type, page, ...o }))

  return {
    q,
    type,
    page,
    data,
    loading,
    failed,
    submit: (next: string) => go({ q: next.trim(), type: 'all', page: 1 }),
    setType: (t: string) => go({ type: t, page: 1 }),
    setPage: (p: number) => go({ page: p }),
  }
}
