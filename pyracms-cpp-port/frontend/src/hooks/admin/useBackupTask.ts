'use client'

import { useState } from 'react'
import { apiErrorMessage } from '@/lib/apiError'

/** Busy flag, live progress line and error for one long backup job. */
export function useBackupTask() {
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState('')
  const [error, setError] = useState('')

  const run = async (label: string, task: () => Promise<void>) => {
    setBusy(true)
    setError('')
    try {
      await task()
    } catch (err) {
      setError(apiErrorMessage(err, `Could not ${label}.`))
    } finally {
      setBusy(false)
      setProgress('')
    }
  }

  return { busy, progress, error, setError, setProgress, run }
}
