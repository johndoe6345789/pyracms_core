'use client'

import { useState } from 'react'
import api from '@/lib/api'
import { apiErrorMessage } from '@/lib/apiError'

/** Owner actions on an article: publish, unpublish, privacy, delete. */
export function useArticleAdmin(
  name: string,
  tenantId: number | null,
  onChanged: () => void,
  onDeleted: () => void,
) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const base = `/api/articles/${encodeURIComponent(name)}`

  const act = async (call: () => Promise<unknown>, done: () => void) => {
    if (!tenantId) return
    setBusy(true)
    setError('')
    try {
      await call()
      done()
    } catch (e) {
      setError(apiErrorMessage(e, 'Action failed'))
    } finally {
      setBusy(false)
    }
  }
  const body = { tenant_id: tenantId }

  return {
    busy,
    error,
    publish: () => act(() => api.post(`${base}/publish`, body), onChanged),
    unpublish: () => act(() => api.post(`${base}/unpublish`, body), onChanged),
    schedule: (at: string) =>
      act(
        () =>
          api.post(`${base}/schedule`, {
            ...body,
            scheduled_at: new Date(at).toISOString(),
          }),
        onChanged,
      ),
    togglePrivate: () => act(() => api.put(`${base}/private`, body), onChanged),
    remove: () =>
      act(() => api.delete(`${base}?tenant_id=${tenantId}`), onDeleted),
  }
}
