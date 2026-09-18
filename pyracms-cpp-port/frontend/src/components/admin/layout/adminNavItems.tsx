import type { ReactNode } from 'react'
import {
  DashboardOutlined, PeopleOutlined,
  SettingsOutlined, ToggleOnOutlined,
  MenuBookOutlined, SecurityOutlined,
  FolderOutlined, BackupOutlined,
  BarChartOutlined, PaletteOutlined,
  CodeOutlined,
} from '@mui/icons-material'

export interface AdminNavItem {
  label: string
  icon: ReactNode
  path: string
}

const ITEMS: [string, ReactNode, string][] = [
  ['Dashboard', <DashboardOutlined />, ''],
  ['Users', <PeopleOutlined />, '/users'],
  ['Settings', <SettingsOutlined />, '/settings'],
  ['Feature Toggles', <ToggleOnOutlined />, '/features'],
  ['Menus', <MenuBookOutlined />, '/menus'],
  ['ACL', <SecurityOutlined />, '/acl'],
  ['Files', <FolderOutlined />, '/files'],
  ['Templates', <CodeOutlined />, '/templates'],
  ['Styles', <PaletteOutlined />, '/styles'],
  ['Analytics', <BarChartOutlined />, '/analytics'],
  ['Backup', <BackupOutlined />, '/backup'],
]

export function buildAdminNavItems(
  slug: string,
): AdminNavItem[] {
  return ITEMS.map(([label, icon, sub]) => ({
    label,
    icon,
    path: `/site/${slug}/admin${sub}`,
  }))
}
