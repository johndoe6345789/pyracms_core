'use client'

import { Typography, Box, Grid } from '@mui/material'
import {
  PeopleOutlined, LanguageOutlined, FolderOutlined,
  SettingsOutlined, ToggleOnOutlined, MenuBookOutlined,
  SecurityOutlined, BackupOutlined,
} from '@mui/icons-material'
import StatCard from '@/components/admin/StatCard'
import QuickLinkCard from '@/components/admin/QuickLinkCard'

const STATS = [
  { label: 'Total Users', value: 142, icon: <PeopleOutlined />, color: '#6366f1' },
  { label: 'Total Tenants', value: 6, icon: <LanguageOutlined />, color: '#ec4899' },
  { label: 'Total Files', value: 384, icon: <FolderOutlined />, color: '#10b981' },
]

const QUICK_LINKS = [
  { label: 'Users', description: 'Manage user accounts', icon: <PeopleOutlined />, href: '/admin/users' },
  { label: 'Settings', description: 'Configure site settings', icon: <SettingsOutlined />, href: '/admin/settings' },
  { label: 'Feature Toggles', description: 'Enable or disable features', icon: <ToggleOnOutlined />, href: '/admin/features' },
  { label: 'Menus', description: 'Edit navigation menus', icon: <MenuBookOutlined />, href: '/admin/menus' },
  { label: 'ACL', description: 'Access control rules', icon: <SecurityOutlined />, href: '/admin/acl' },
  { label: 'Files', description: 'Manage uploaded files', icon: <FolderOutlined />, href: '/admin/files' },
  { label: 'Backup', description: 'Export and import data', icon: <BackupOutlined />, href: '/admin/backup' },
]

export default function AdminDashboardPage() {
  return (
    <Box>
      <Typography variant="h3" sx={{ mb: 1 }}>Dashboard</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Overview of your PyraCMS installation.
      </Typography>
      <Grid container spacing={3} sx={{ mb: 5 }}>
        {STATS.map((s) => (
          <Grid item xs={12} sm={4} key={s.label}>
            <StatCard {...s} />
          </Grid>
        ))}
      </Grid>
      <Typography variant="h4" sx={{ mb: 3 }}>Quick Links</Typography>
      <Grid container spacing={3}>
        {QUICK_LINKS.map((link) => (
          <Grid item xs={12} sm={6} md={4} key={link.label}>
            <QuickLinkCard {...link} />
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}
