'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { apiErrorMessage } from '@/lib/apiError'

export type VerifyStatus = 'pending' | 'ok' | 'error'

/** Spends the e-mail verification token once on mount. */
export function useVerifyEmail(token: string) {
  const [status, setStatus] = useState<VerifyStatus>(
    token ? 'pending' : 'error',
  )
  const [message, setMessage] = useState(
    token ? '' : 'This verification link is missing its token',
  )
  useEffect(() => {
    if (!token) return
    api
      .post('/api/auth/verify-email', { token })
      .then(() => setStatus('ok'))
      .catch((e) => {
        setMessage(apiErrorMessage(e, 'Could not verify your email'))
        setStatus('error')
      })
  }, [token])
  return { status, message }
}
