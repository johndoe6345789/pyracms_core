'use client'

import { useCallback, useRef, useState } from 'react'
import { uploadFileAuto } from '@/lib/uploadFileAuto'
import { apiErrorMessage } from '@/lib/apiError'
import type { UploadResult } from '@/lib/chunkedTypes'

export interface UploadProgressState {
  done: number
  total: number
}

/** Upload one archive/binary with progress, error and cancel state. */
export function useArchiveUpload(tenantId?: number | null) {
  const [progress, setProgress] = useState<UploadProgressState | null>(null)
  const [error, setError] = useState('')
  const [result, setResult] = useState<UploadResult | null>(null)
  const ctl = useRef<AbortController | null>(null)

  const upload = useCallback(
    async (file: File) => {
      ctl.current?.abort()
      const c = new AbortController()
      ctl.current = c
      setError('')
      setResult(null)
      setProgress({ done: 0, total: file.size })
      try {
        const res = await uploadFileAuto(file, {
          tenantId,
          signal: c.signal,
          onProgress: (done, total) => setProgress({ done, total }),
        })
        setResult(res)
      } catch (err) {
        if (!c.signal.aborted) {
          setError(apiErrorMessage(err, `Could not upload ${file.name}`))
        }
      } finally {
        if (ctl.current === c) setProgress(null)
      }
    },
    [tenantId],
  )

  const cancel = useCallback(() => ctl.current?.abort(), [])

  return { progress, error, result, upload, cancel }
}
