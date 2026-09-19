'use client'

import { useSelector } from 'react-redux'
import type { RootState } from '@/store/store'
import type { User } from '@/types'

/**
 * Accounts are per-site: a session for another site is a guest here.
 * Platform accounts (no tenantSlug) are valid on any site.
 */
export function isSessionOnSite(
  isAuthenticated: boolean,
  user: User | null,
  slug: string,
): boolean {
  return isAuthenticated && (!user?.tenantSlug || user.tenantSlug === slug)
}

/** True when the signed-in session belongs to the site `slug`. */
export function useSiteSession(slug: string): boolean {
  const { user, isAuthenticated } = useSelector((s: RootState) => s.auth)
  return isSessionOnSite(isAuthenticated, user, slug)
}
