'use client'

import { useSiteFeatures } from '@/hooks/useSiteFeatures'
import { useSiteMenu } from '@/hooks/useSiteMenu'
import { usePermissions } from '@/hooks/usePermissions'
import { exploreEntry, homeEntry } from '@/components/layout/exploreNav'
import { menuEntries } from '@/components/layout/siteMenu'
import { tenantModuleEntries } from '@/components/layout/tenantNav'

/**
 * Everything a site's navigation needs: the owner's own links (top row),
 * the stock links (Explore dropdown) and the flags/permissions behind them.
 */
export function useSiteNav(slug: string) {
  const { flags } = useSiteFeatures(slug)
  const { items } = useSiteMenu(slug)
  const perms = usePermissions(slug)
  const canAdmin = perms.can('manageSite')
  const ownerLinks = menuEntries(slug, items, {
    signedIn: perms.signedIn,
    canAdmin,
  })
  return {
    flags,
    canAdmin,
    ownerLinks,
    // A site with no menu of its own still gets a way home
    topLinks: ownerLinks.length ? ownerLinks : [homeEntry(slug)],
    explore: exploreEntry(slug, tenantModuleEntries(slug, flags), canAdmin),
  }
}
