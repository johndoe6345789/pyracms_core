import {
  HomeOutlined,
  SearchOutlined,
  AdminPanelSettingsOutlined,
  ArrowBackOutlined,
} from '@mui/icons-material'
import { NAV_ITEMS } from '@/hooks/useTenantNav'
import { hypernucleusEntry } from './hypernucleusNav'
import { filterNavByFeatures, MODULE_FEATURE } from './navFeatures'
import type { FeatureFlags } from '@/lib/siteFeatures'
import type { NavEntry, NavSection } from './navTypes'

/**
 * Module links for one site (also used for the inline top-bar links).
 * `flags` hides the modules the site switched off (null = show all).
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

export function tenantSections(
  slug: string,
  canAdmin: boolean,
  flags: FeatureFlags | null = null,
): NavSection[] {
  const site: NavEntry[] = [
    {
      key: 'home',
      label: 'Home',
      href: `/site/${slug}`,
      icon: <HomeOutlined />,
      exact: true,
    },
    ...tenantModuleEntries(slug, flags),
    {
      key: 'search',
      label: 'Search',
      href: '/search',
      icon: <SearchOutlined />,
      testId: 'search',
    },
  ]
  const sections: NavSection[] = [{ title: 'Explore', items: site }]
  if (canAdmin) {
    sections.push({
      title: 'Manage',
      items: [
        {
          key: 'admin',
          label: 'Admin',
          href: `/site/${slug}/admin`,
          icon: <AdminPanelSettingsOutlined />,
          testId: 'admin',
        },
      ],
    })
  }
  return sections
}

export const TENANT_FOOTER = {
  label: 'Back to Portal',
  href: '/',
  icon: <ArrowBackOutlined />,
}
