'use client'

import AppTopBar from './AppTopBar'
import { useSiteNav } from '@/hooks/useSiteNav'

interface TenantAppBarProps {
  slug: string
  siteName: string
  drawerOpen: boolean
  onMenuClick: () => void
}

/**
 * Top bar for a site: the owner's own links along the top, the stock links
 * in an Explore dropdown on the right.
 */
export default function TenantAppBar({
  slug,
  siteName,
  drawerOpen,
  onMenuClick,
}: TenantAppBarProps) {
  const nav = useSiteNav(slug)
  return (
    <AppTopBar
      brand={siteName}
      brandHref={`/site/${slug}`}
      items={nav.topLinks}
      explore={nav.explore}
      drawerOpen={drawerOpen}
      onMenuClick={onMenuClick}
      navLabel="Site navigation"
      downloadHref={`/site/${slug}/download`}
    />
  )
}
