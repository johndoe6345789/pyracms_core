'use client'

import { useSelector } from 'react-redux'
import type { RootState } from '@/store/store'
import { UserRole } from '@/types'
import { isSessionOnSite } from '@/hooks/useSiteSession'

/** Owner or site admin - mirrors the backend OwnerFilter. */
export function useCanManage(slug: string, ownerId: number | null) {
  const { user, isAuthenticated } = useSelector((s: RootState) => s.auth)
  if (!user || !isSessionOnSite(isAuthenticated, user, slug)) return false
  const admin = user.isAdmin || (user.role ?? 0) >= UserRole.SiteAdmin
  return admin || (ownerId !== null && user.id === ownerId)
}
