import type { ReactNode } from 'react'
import type { SvgIconComponent } from '@mui/icons-material'
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

const ITEMS: [string, SvgIconComponent, string][] = [
  ['Dashboard', DashboardOutlined, ''],
  ['Users', PeopleOutlined, '/users'],
  ['Settings', SettingsOutlined, '/settings'],
  ['Feature Toggles', ToggleOnOutlined, '/features'],
  ['Menus', MenuBookOutlined, '/menus'],
  ['ACL', SecurityOutlined, '/acl'],
  ['Files', FolderOutlined, '/files'],
  ['Templates', CodeOutlined, '/templates'],
  ['Styles', PaletteOutlined, '/styles'],
  ['Analytics', BarChartOutlined, '/analytics'],
  ['Webhooks', WebhookOutlined, '/webhooks'],
  ['Audit Log', HistoryOutlined, '/audit'],
  ['Backup', BackupOutlined, '/backup'],
]

export function buildAdminNavItems(slug: string): AdminNavItem[] {
  return ITEMS.map(([label, Icon, sub]) => ({
    label,
    icon: <Icon />,
    path: `/site/${slug}/admin${sub}`,
  }))
}
