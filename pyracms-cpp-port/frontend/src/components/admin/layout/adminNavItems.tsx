import type { ReactNode } from 'react'
import {
  DashboardOutlined,
  PeopleOutlined,
  SettingsOutlined,
  ToggleOnOutlined,
  MenuBookOutlined,
  SecurityOutlined,
  FolderOutlined,
  BackupOutlined,
  BarChartOutlined,
  PaletteOutlined,
  CodeOutlined,
  WebhookOutlined,
  HistoryOutlined,
} from '@mui/icons-material'

export interface AdminNavItem {
  label: string
  icon: ReactNode
  path: string
}

// Static tuples, not a rendered list: no keys needed.
/* eslint-disable react/jsx-key */
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
  ['Webhooks', <WebhookOutlined />, '/webhooks'],
  ['Audit Log', <HistoryOutlined />, '/audit'],
  ['Backup', <BackupOutlined />, '/backup'],
]
/* eslint-enable react/jsx-key */

export function buildAdminNavItems(slug: string): AdminNavItem[] {
  return ITEMS.map(([label, icon, sub]) => ({
    label,
    icon,
    path: `/site/${slug}/admin${sub}`,
  }))
}
