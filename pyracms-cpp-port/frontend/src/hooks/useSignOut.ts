'use client'

import { useDispatch } from 'react-redux'
import { useRouter } from 'next/navigation'
import { logout } from '@/store/slices/authSlice'
import { clearToken } from '@/lib/session'

/**
 * Signs out of the current scope only (site or platform); other sites
 * keep their own sessions. `then` runs before navigating home.
 */
export function useSignOut(slug: string | undefined, then?: () => void) {
  const dispatch = useDispatch()
  const router = useRouter()
  return () => {
    clearToken(slug ?? null)
    dispatch(logout())
    then?.()
    router.push(slug ? `/site/${slug}` : '/')
  }
}
