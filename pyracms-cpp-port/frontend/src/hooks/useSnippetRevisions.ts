'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import api from '@/lib/api'
import { apiErrorMessage } from '@/lib/apiError'
import { mapDiffRevisions, mapRevisions } from './useRevisions'

/**
 * A snippet's history (GET /api/snippets/{id}/revisions, newest first) in
 * the shapes the article revision components already take, plus revert.
 * Revisions are numbered 1, 2, 3... per snippet.
 */
export function useSnippetRevisions(id: string, tenantId: number | null) {
  const [raw, setRaw] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const url = `/api/snippets/${id}/revisions?tenant_id=${tenantId}`
  const load = useCallback(
    () => api.get(url).then((res) => setRaw(res.data || [])),
    [url],
  )

  useEffect(() => {
    if (!id || !tenantId) return
    setLoading(true)
    load()
      .catch((e) => setError(apiErrorMessage(e, 'Could not load history')))
      .finally(() => setLoading(false))
  }, [id, tenantId, load])

  const revisions = useMemo(() => mapRevisions(raw), [raw])
  // the diff viewer compares `content`; a snippet's is its code
  const diffs = useMemo(
    () => mapDiffRevisions(raw.map((r) => ({ ...r, content: r.code }))),
    [raw],
  )
  const byNumber = (n: number) => raw.find((r) => r.revisionNumber === n)

  const revert = async (n: number) => {
    setError('')
    try {
      await api.post(`/api/snippets/${id}/revert/${n}`, {})
      await load()
    } catch (e) {
      setError(apiErrorMessage(e, 'Could not revert'))
    }
  }

  return {
    revisions,
    diffs,
    loading,
    error,
    revert,
    byNumber,
    latest: revisions[0]?.number ?? 0,
  }
}
