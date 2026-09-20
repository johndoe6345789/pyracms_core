'use client'

import { useState } from 'react'
import { useSelector } from 'react-redux'
import AppTopBar from './AppTopBar'
import AppDrawer from './AppDrawer'
import SetupRedirect from '@/components/portal/SetupRedirect'
import { portalEntries, portalSections } from './navConfig'
import { hasMinRole, UserRole } from '@/types'
import type { RootState } from '@/store/store'

/**
 * Top bar and burger drawer for the portal home: the same components a
 * site uses, fed with portal destinations.
 */
export default function PortalShell() {
  const [open, setOpen] = useState(false)
  const user = useSelector((s: RootState) => s.auth.user)
  const isSuperAdmin = hasMinRole(user, UserRole.SuperAdmin)

  return (
    <>
      <SetupRedirect />
      <AppTopBar
        brand="PyraCMS"
        brandHref="/"
        items={portalEntries()}
        drawerOpen={open}
        onMenuClick={() => setOpen((o) => !o)}
        navLabel="Portal navigation"
      />
      <AppDrawer
        open={open}
        onClose={() => setOpen(false)}
        title="PyraCMS"
        subtitle="Multi-tenant CMS portal"
        sections={portalSections(isSuperAdmin)}
        testId="portal-drawer"
      />
    </>
  )
}
