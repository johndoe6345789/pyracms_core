'use client'

import { useCallback } from 'react'
import { useSelector } from 'react-redux'
import { can, effectiveRole, type Capability } from '@/lib/permissions'
import { isSessionOnSite } from '@/hooks/useSiteSession'
import { useTenant } from '@/hooks/useTenant'
import { UserRole } from '@/types'
import type { RootState } from '@/store/store'

/**
 * What the signed-in visitor may do on site `slug`. A session that belongs
 * to another site counts as a Guest here (accounts are per site).
 */
export function usePermissions(slug: string) {
  const { user, isAuthenticated } = useSelector((s: RootState) => s.auth)
  const { tenant } = useTenant(slug)
  const here = isSessionOnSite(isAuthenticated, user, slug)
  const stored = here ? (user?.role ?? UserRole.User) : null
  const isOwner = here && !!tenant && user?.id === tenant.ownerId
  const role = effectiveRole(stored, isOwner)
  const allowed = useCallback(
    (cap: Capability) => can(cap, stored, isOwner),
    [stored, isOwner],
  )
  return { role, isOwner, signedIn: here, can: allowed }
}
