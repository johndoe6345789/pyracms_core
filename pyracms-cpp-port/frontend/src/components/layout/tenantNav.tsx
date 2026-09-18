import {
  HomeOutlined,
  SearchOutlined,
  AdminPanelSettingsOutlined,
  ArrowBackOutlined,
} from '@mui/icons-material'
import { NAV_ITEMS } from '@/hooks/useTenantNav'
import type { NavEntry, NavSection } from './navTypes'

/** Module links for one site (also used for the inline top-bar links). */
export function tenantModuleEntries(slug: string): NavEntry[] {
  return NAV_ITEMS.map((item) => ({
    key: item.path,
    label: item.label,
    href: `/site/${slug}/${item.path}`,
    icon: item.icon,
  }))
}

export function tenantSections(
  slug: string,
  canAdmin: boolean,
): NavSection[] {
  const site: NavEntry[] = [
    {
      key: 'home', label: 'Home', href: `/site/${slug}`,
      icon: <HomeOutlined />, exact: true,
    },
    ...tenantModuleEntries(slug),
    {
      key: 'search', label: 'Search', href: '/search',
      icon: <SearchOutlined />, testId: 'search',
    },
  ]
  const sections: NavSection[] = [{ title: 'Explore', items: site }]
  if (canAdmin) {
    sections.push({
      title: 'Manage',
      items: [{
        key: 'admin', label: 'Admin', href: `/site/${slug}/admin`,
        icon: <AdminPanelSettingsOutlined />, testId: 'admin',
      }],
    })
  }
  return sections
}

export const TENANT_FOOTER = {
  label: 'Back to Portal',
  href: '/',
  icon: <ArrowBackOutlined />,
}
