import type { ReactNode } from 'react'
import type { SvgIconComponent } from '@mui/icons-material'
import {
  DashboardOutlined,
  PeopleOutlined,
  SettingsOutlined,
  ToggleOnOutlined,
  MenuBookOutlined,
  FolderOutlined,
  BackupOutlined,
  BarChartOutlined,
  PaletteOutlined,
  WebhookOutlined,
  HistoryOutlined,
  ManageSearchOutlined,
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
  ['Files', FolderOutlined, '/files'],
  ['Styles', PaletteOutlined, '/styles'],
  ['Analytics', BarChartOutlined, '/analytics'],
  ['Webhooks', WebhookOutlined, '/webhooks'],
  ['Search Indexing', ManageSearchOutlined, '/search'],
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
