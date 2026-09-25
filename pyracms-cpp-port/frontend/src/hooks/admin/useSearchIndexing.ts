'use client'

import { useCallback, useEffect, useState } from 'react'
import api from '@/lib/api'
import { apiErrorMessage } from '@/lib/apiError'

export interface SearchStatus {
  engine: string
  configured: boolean
  reachable: boolean
  source: Record<string, number>
  indexed: Record<string, number>
  pending: number
}

const EMPTY: SearchStatus = {
  engine: 'postgresql',
  configured: false,
  reachable: false,
  source: {},
  indexed: {},
  pending: 0,
}

/**
 * The site's search index (GET /api/admin/search) and a rebuild
 * (POST /api/admin/search/reindex). While changes are still queued the
 * status is re-read every few seconds so the counts visibly catch up.
 */
export function useSearchIndexing(tenantId: number | null) {
  const [status, setStatus] = useState<SearchStatus>(EMPTY)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [queued, setQueued] = useState<number | null>(null)
  const url = `/api/admin/search?tenant_id=${tenantId}`

  const load = useCallback(async () => {
    if (!tenantId) return
    try {
      const res = await api.get(url)
      setStatus({ ...EMPTY, ...res.data })
    } catch (e) {
      setError(apiErrorMessage(e, 'Could not load the search status'))
    } finally {
      setLoading(false)
    }
  }, [tenantId, url])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (!status.pending) return
    const t = setTimeout(load, 3000)
    return () => clearTimeout(t)
  }, [status, load])

  const reindex = async () => {
    setBusy(true)
    setError('')
    try {
      const res = await api.post(
        `/api/admin/search/reindex?tenant_id=${tenantId}`,
        {},
      )
      setQueued(Number(res.data?.queued ?? 0))
      await load()
    } catch (e) {
      setError(apiErrorMessage(e, 'Could not start the reindex'))
    } finally {
      setBusy(false)
    }
  }

  return { status, loading, busy, error, queued, reindex }
}
