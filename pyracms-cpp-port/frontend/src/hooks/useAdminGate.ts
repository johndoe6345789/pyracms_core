'use client'

import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useTenantNav } from '@/hooks/useTenantNav'
import { getToken } from '@/lib/session'
import type { RootState } from '@/store/store'

/** Longest we wait for a stored session to be restored. */
export const RESTORE_TIMEOUT_MS = 4000

/**
 * Decides whether the admin area may be shown. `checking` stays true
 * while the site record loads or a stored session is still being
 * restored, so the forbidden state never flashes for a real admin.
 */
export function useAdminGate() {
  const { slug, canAdmin, loading } = useTenantNav()
  const signedIn = useSelector((s: RootState) => s.auth.isAuthenticated)
  const [gaveUp, setGaveUp] = useState(false)
  const restoring = !signedIn && !gaveUp && getToken(slug) !== null

  useEffect(() => {
    if (!restoring) return
    const t = setTimeout(() => setGaveUp(true), RESTORE_TIMEOUT_MS)
    return () => clearTimeout(t)
  }, [restoring])

  return { slug, allowed: canAdmin, checking: loading || restoring }
}
