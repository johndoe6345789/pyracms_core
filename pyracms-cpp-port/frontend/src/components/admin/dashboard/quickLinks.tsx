import type { ReactNode } from 'react'
import {
  PeopleOutlined, FolderOutlined, SettingsOutlined,
  ToggleOnOutlined, MenuBookOutlined, SecurityOutlined,
  BackupOutlined,
} from '@mui/icons-material'

export interface QuickLink {
  label: string
  description: string
  icon: ReactNode
  href: string
}

export function buildQuickLinks(slug: string): QuickLink[] {
  const base = `/site/${slug}/admin`
  return [
    {
      label: 'Users',
      description: 'Manage user accounts',
      icon: <PeopleOutlined />,
      href: `${base}/users`,
    },
    {
      label: 'Settings',
      description: 'Configure site settings',
      icon: <SettingsOutlined />,
      href: `${base}/settings`,
    },
    {
      label: 'Feature Toggles',
      description: 'Enable or disable features',
      icon: <ToggleOnOutlined />,
      href: `${base}/features`,
    },
    {
      label: 'Menus',
      description: 'Edit navigation menus',
      icon: <MenuBookOutlined />,
      href: `${base}/menus`,
    },
    {
      label: 'ACL',
      description: 'Access control rules',
      icon: <SecurityOutlined />,
      href: `${base}/acl`,
    },
    {
      label: 'Files',
      description: 'Manage uploaded files',
      icon: <FolderOutlined />,
      href: `${base}/files`,
    },
    {
      label: 'Backup',
      description: 'Export and import data',
      icon: <BackupOutlined />,
      href: `${base}/backup`,
    },
  ]
}
