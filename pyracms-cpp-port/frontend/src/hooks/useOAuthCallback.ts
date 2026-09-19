'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useDispatch } from 'react-redux'
import api from '@/lib/api'
import { apiErrorMessage } from '@/lib/apiError'
import { takeOAuth } from '@/lib/oauth'
import { setToken } from '@/lib/session'
import { setCredentials } from '@/store/slices/authSlice'

/** Finishes an OAuth sign-in: code/state -> session, then redirect. */
export function useOAuthCallback(code: string, state: string) {
  const router = useRouter()
  const dispatch = useDispatch()
  const [error, setError] = useState('')
  const started = useRef(false)

  useEffect(() => {
    if (started.current) return
    started.current = true
    const pending = takeOAuth()
    if (!code || !state || !pending) {
      setError('Sign-in was cancelled or the link is no longer valid')
      return
    }
    api.post(`/api/auth/oauth/${pending.provider}/callback`, { code, state })
      .then(({ data }) => {
        if (!data?.token) throw new Error('no token')
        // OAuth creates platform accounts, valid on every site
        setToken(null, data.token)
        dispatch(setCredentials({ user: data.user, token: data.token }))
        router.replace(pending.redirectTo ?? '/')
      })
      .catch((e) => setError(apiErrorMessage(e, 'Sign-in failed')))
  }, [code, state, dispatch, router])

  return { error }
}
