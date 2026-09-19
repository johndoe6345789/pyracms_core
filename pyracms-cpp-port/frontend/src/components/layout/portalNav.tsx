import {
  HomeOutlined,
  SearchOutlined,
  AddCircleOutlineOutlined,
  GridViewOutlined,
  ShieldOutlined,
  DownloadOutlined,
} from '@mui/icons-material'
import type { NavEntry, NavSection } from './navTypes'

/** Drawer-only entry (the inline top-bar links leave room for the tool). */
export function launcherEntry(href: string): NavEntry {
  return {
    key: 'download',
    label: 'Get the launcher',
    href,
    icon: <DownloadOutlined />,
    testId: 'download',
  }
}

export function portalEntries(): NavEntry[] {
  return [
    {
      key: 'home',
      label: 'Home',
      href: '/',
      icon: <HomeOutlined />,
      exact: true,
    },
    {
      key: 'sites',
      label: 'Sites',
      href: '/#sites',
      icon: <GridViewOutlined />,
      exact: true,
    },
    {
      key: 'create-site',
      label: 'Create a site',
      href: '/create-site',
      icon: <AddCircleOutlineOutlined />,
    },
    {
      key: 'search',
      label: 'Search',
      href: '/search',
      icon: <SearchOutlined />,
    },
  ]
}

export function portalSections(isSuperAdmin: boolean): NavSection[] {
  const sections: NavSection[] = [
    {
      title: 'Portal',
      items: [...portalEntries(), launcherEntry('/download')],
    },
  ]
  if (isSuperAdmin) {
    sections.push({
      title: 'Platform',
      items: [
        {
          key: 'super-admin',
          label: 'Platform owner',
          href: '/super-admin',
          icon: <ShieldOutlined />,
        },
      ],
    })
  }
  return sections
}
