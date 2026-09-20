import {
  AdminPanelSettingsOutlined,
  AppsOutlined,
  HomeOutlined,
  SearchOutlined,
} from '@mui/icons-material'
import type { NavEntry } from './navTypes'

export const homeEntry = (slug: string): NavEntry => ({
  key: 'home',
  label: 'Home',
  href: `/site/${slug}`,
  icon: <HomeOutlined />,
  exact: true,
})

export const searchEntry = (): NavEntry => ({
  key: 'search',
  label: 'Search',
  href: '/search',
  icon: <SearchOutlined />,
  testId: 'search',
})

export const adminEntry = (slug: string): NavEntry => ({
  key: 'admin',
  label: 'Admin',
  href: `/site/${slug}/admin`,
  icon: <AdminPanelSettingsOutlined />,
  testId: 'admin',
})

/**
 * The stock links (Articles, Forum, Gallery, Hypernucleus, Code, Tags,
 * Search, and Admin for admins) as one "Explore" dropdown. The site owner's
 * own links take the top row instead.
 */
export function exploreEntry(
  slug: string,
  modules: NavEntry[],
  canAdmin: boolean,
): NavEntry {
  // Plain links first, then titled groups (Hypernucleus), then Admin, so a
  // group's heading never swallows the links that follow it.
  const plain = modules.filter((m) => !m.children?.length)
  const groups = modules.filter((m) => m.children?.length)
  return {
    key: 'explore',
    label: 'Explore',
    href: `/site/${slug}`,
    icon: <AppsOutlined />,
    children: [
      ...plain,
      searchEntry(),
      ...groups,
      ...(canAdmin ? [adminEntry(slug)] : []),
    ],
  }
}
