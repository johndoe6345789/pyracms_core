'use client'

import { useState } from 'react'
import { apiErrorMessage } from '@/lib/apiError'

/** Runs an async action tracking busy / error / done for a form. */
export function useFormSubmit(fallback: string) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const run = async (action: () => Promise<unknown>) => {
    setBusy(true)
    setError('')
    setDone(false)
    try {
      await action()
      setDone(true)
      return true
    } catch (e) {
      setError(apiErrorMessage(e, fallback))
      return false
    } finally {
      setBusy(false)
    }
  }
  const fail = (message: string) => {
    setDone(false)
    setError(message)
    return false
  }

  return { busy, error, done, run, fail }
}
