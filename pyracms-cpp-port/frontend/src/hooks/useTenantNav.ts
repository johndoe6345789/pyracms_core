'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useSelector } from 'react-redux'
import { useTenant, titleFromSlug } from '@/hooks/useTenant'
import { isSessionOnSite } from '@/hooks/useSiteSession'
import { hasMinRole, UserRole } from '@/types'
import type { RootState } from '@/store/store'

import { NAV_ITEMS } from '@/hooks/navItems'

export { NAV_ITEMS }

export function useTenantNav() {
  const params = useParams()
  const slug = params.slug as string
  const { tenant, loading } = useTenant(slug)
  const siteName = tenant?.displayName ?? titleFromSlug(slug)

  const { user, isAuthenticated } = useSelector((s: RootState) => s.auth)
  const sessionHere = isSessionOnSite(isAuthenticated, user, slug)
  const canAdmin =
    sessionHere &&
    (hasMinRole(user, UserRole.SiteAdmin) ||
      (tenant !== null && user?.id === tenant.ownerId))

  const [drawerOpen, setDrawerOpen] = useState(false)

  const openDrawer = () => setDrawerOpen(true)
  const closeDrawer = () => setDrawerOpen(false)
  const toggleDrawer = () => setDrawerOpen((o) => !o)

  return {
    slug,
    siteName,
    tenant,
    loading,
    canAdmin,
    drawerOpen,
    openDrawer,
    closeDrawer,
    toggleDrawer,
  }
}
