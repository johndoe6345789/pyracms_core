'use client'

import AppTopBar from './AppTopBar'
import { tenantModuleEntries } from './navConfig'

interface TenantAppBarProps {
  slug: string
  siteName: string
  drawerOpen: boolean
  onMenuClick: () => void
}

/** Top bar for a site: the shared bar with that site's module links. */
export default function TenantAppBar({
  slug, siteName, drawerOpen, onMenuClick,
}: TenantAppBarProps) {
  return (
    <AppTopBar
      brand={siteName}
      brandHref={`/site/${slug}`}
      items={tenantModuleEntries(slug)}
      drawerOpen={drawerOpen}
      onMenuClick={onMenuClick}
      navLabel="Site navigation"
      downloadHref={`/site/${slug}/download`}
    />
  )
}
