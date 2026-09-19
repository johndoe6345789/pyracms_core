'use client'

import { useState } from 'react'
import api from '@/lib/api'
import { apiErrorMessage } from '@/lib/apiError'

/** Edit / delete an album or a picture (owner or admin only). */
export function useGalleryManage(kind: 'albums' | 'pictures', id: string) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const url = `/api/gallery/${kind}/${id}`

  const run = async (call: () => Promise<unknown>, done: () => void) => {
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
  return {
    busy,
    error,
    clearError: () => setError(''),
    update: (displayName: string, description: string, done: () => void) =>
      run(() => api.put(url, { displayName, description }), done),
    remove: (done: () => void) => run(() => api.delete(url), done),
  }
}
