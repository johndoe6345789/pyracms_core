'use client'

import { useState, useCallback } from 'react'
import api from '@/lib/api'
import { mapRunResult, type RunResult } from '@/lib/snippets'

export function useSnippetRun() {
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState<RunResult | null>(null)

  const run = useCallback(async (id: string) => {
    setRunning(true)
    setResult(null)
    try {
      const res = await api.post(`/api/snippets/${id}/run`)
      setResult(mapRunResult(res.data))
    } catch (e) {
      const status = (
        e as {
          response?: { status?: number }
        }
      ).response?.status
      setResult({
        stdout: '',
        stderr:
          status === 401
            ? 'Please log in to run snippets.'
            : 'Failed to run snippet.',
        exitCode: 1,
      })
    } finally {
      setRunning(false)
    }
  }, [])

  return { running, result, run, setResult }
}
