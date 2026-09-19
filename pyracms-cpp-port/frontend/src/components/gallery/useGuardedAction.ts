import { useState } from 'react'
import { apiErrorMessage } from '@/lib/apiError'

/** Runs async actions, exposing the last failure as `error`. */
export function useGuardedAction() {
  const [error, setError] = useState('')
  const guard = (task: () => Promise<unknown>, label: string) => {
    setError('')
    return task().catch((e) => setError(apiErrorMessage(e, label)))
  }
  return { error, guard }
}
