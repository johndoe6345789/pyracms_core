'use client'

import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { usePathname } from 'next/navigation'
import { setCredentials, logout } from '@/store/slices/authSlice'
import api from '@/lib/api'
import { clearToken, getToken, scopeFromPath } from '@/lib/session'

/**
 * Restores the session for the scope being viewed. The scope is the
 * current site (or the platform on portal pages); moving between sites
 * swaps to that site's own session, and signing out of one leaves the
 * others intact.
 */
export function useAuthHydration() {
  const dispatch = useDispatch()
  const scope = scopeFromPath(usePathname())

  useEffect(() => {
    const token = getToken(scope)
    if (!token) {
      dispatch(logout())
      return
    }

    let cancelled = false
    api.get('/api/auth/me')
      .then(res => {
        if (!cancelled) {
          dispatch(setCredentials({ user: res.data, token }))
        }
      })
      .catch(() => {
        if (cancelled) return
        clearToken(scope)
        dispatch(logout())
      })
    return () => { cancelled = true }
  }, [dispatch, scope])
}
