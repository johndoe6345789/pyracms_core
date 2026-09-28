'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import {
  videoListParams,
  type VideoQuery,
  type VideoSummary,
} from '@/lib/videos'

interface Page {
  total: number
  items: VideoSummary[]
}

const fetchPage = (tenantId: number, query: VideoQuery, offset: number) =>
  api
    .get(`/api/videos?${videoListParams(tenantId, query, offset)}`)
    .then((r) => ({ total: r.data?.total ?? 0, items: r.data?.items ?? [] }))

/** One listing of GET /api/videos with "load more" paging by offset. */
export function useVideoList(tenantId: number | null, query: VideoQuery) {
  const [page, setPage] = useState<Page>({ total: 0, items: [] })
  const [loading, setLoading] = useState(true)
  const { userId, q, sort, limit } = query

  useEffect(() => {
    if (!tenantId) return
    let live = true
    setLoading(true)
    fetchPage(tenantId, { userId, q, sort, limit }, 0)
      .then((p) => live && setPage(p))
      .catch(() => live && setPage({ total: 0, items: [] }))
      .finally(() => live && setLoading(false))
    return () => {
      live = false
    }
  }, [tenantId, userId, q, sort, limit])

  const loadMore = () => {
    if (!tenantId) return Promise.resolve()
    setLoading(true)
    return fetchPage(tenantId, query, page.items.length)
      .then((p) =>
        setPage((prev) => ({
          total: p.total,
          items: [...prev.items, ...p.items],
        })),
      )
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  return {
    items: page.items,
    total: page.total,
    loading,
    hasMore: page.items.length < page.total,
    loadMore,
  }
}
