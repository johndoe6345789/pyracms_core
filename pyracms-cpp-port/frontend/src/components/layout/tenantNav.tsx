import { ArrowBackOutlined } from '@mui/icons-material'
import { NAV_ITEMS } from '@/hooks/useTenantNav'
import { adminEntry, homeEntry, searchEntry } from './exploreNav'
import { hypernucleusEntry } from './hypernucleusNav'
import { filterNavByFeatures, MODULE_FEATURE } from './navFeatures'
import type { FeatureFlags } from '@/lib/siteFeatures'
import type { NavEntry, NavSection } from './navTypes'

/**
 * The stock modules of a site (Articles, Forum, Gallery, Hypernucleus, Code,
 * Tags). `flags` hides the ones the site switched off (null = show all).
 */
export function tenantModuleEntries(
  slug: string,
  flags: FeatureFlags | null = null,
): NavEntry[] {
  const modules: NavEntry[] = NAV_ITEMS.map((item) => ({
    key: item.path,
    label: item.label,
    href: `/site/${slug}/${item.path}`,
    icon: item.icon,
    ...(MODULE_FEATURE[item.path] && { feature: MODULE_FEATURE[item.path] }),
  }))
  const at = modules.findIndex((m) => m.key === 'gallery') + 1
  modules.splice(at, 0, hypernucleusEntry(slug))
  return filterNavByFeatures(modules, flags)
}

/**
 * Burger drawer of a site. The owner's own links come first, under the
 * site's menu; the stock links follow as "Explore".
 */
export function tenantSections(
  slug: string,
  canAdmin: boolean,
  flags: FeatureFlags | null = null,
  ownerLinks: NavEntry[] = [],
): NavSection[] {
  const explore = [...tenantModuleEntries(slug, flags), searchEntry()]
  const sections: NavSection[] = ownerLinks.length
    ? [
        { title: 'Menu', items: [homeEntry(slug), ...ownerLinks] },
        { title: 'Explore', items: explore },
      ]
    : [{ title: 'Explore', items: [homeEntry(slug), ...explore] }]
  if (canAdmin) sections.push({ title: 'Manage', items: [adminEntry(slug)] })
  return sections
}

export const TENANT_FOOTER = {
  label: 'Back to Portal',
  href: '/',
  icon: <ArrowBackOutlined />,
}
