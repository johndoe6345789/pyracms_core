import { useState, useCallback } from 'react'
import { apiErrorMessage } from '@/lib/apiError'

/** Error state for user-initiated mutations. */
export function useActionError() {
  const [error, setError] = useState('')
  /** Returns a `.catch` handler that records `fallback`/API error. */
  const fail = useCallback(
    (fallback: string) => (e: unknown) =>
      setError(apiErrorMessage(e, fallback)),
    [],
  )
  return { error, setError, fail }
}
