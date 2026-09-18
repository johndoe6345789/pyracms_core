'use client'

import { useState } from 'react'
import { useParams, usePathname } from 'next/navigation'
import { useSelector } from 'react-redux'
import { useTenant, titleFromSlug } from '@/hooks/useTenant'
import { hasMinRole, UserRole } from '@/types'
import type { RootState } from '@/store/store'

import { NAV_ITEMS } from '@/hooks/navItems'

export { NAV_ITEMS }

export function useTenantNav() {
  const params = useParams()
  const pathname = usePathname()
  const slug = params.slug as string
  const { tenant } = useTenant(slug)
  const siteName = tenant?.displayName ?? titleFromSlug(slug)

  const { user, isAuthenticated } = useSelector(
    (s: RootState) => s.auth,
  )
  // Accounts are per-site: a session for another site is a guest here.
  const sessionHere = isAuthenticated
    && (!user?.tenantSlug || user.tenantSlug === slug)
  const canAdmin = sessionHere && (
    hasMinRole(user, UserRole.SiteAdmin)
    || (tenant !== null && user?.id === tenant.ownerId)
  )

  const [drawerOpen, setDrawerOpen] = useState(false)

  const openDrawer = () => setDrawerOpen(true)
  const closeDrawer = () => setDrawerOpen(false)
  const toggleDrawer = () => setDrawerOpen((o) => !o)

  const activeLink = NAV_ITEMS.find(
    (item) => pathname === `/site/${slug}/${item.path}`
  )?.path

  return {
    slug, siteName, tenant, canAdmin,
    drawerOpen, openDrawer, closeDrawer, toggleDrawer, activeLink,
  }
}
