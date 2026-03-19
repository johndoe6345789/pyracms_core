'use client'

import { useParams } from 'next/navigation'
import { Typography, Box, Grid } from '@mui/material'
import {
  PeopleOutlined, FolderOutlined,
  SettingsOutlined, ToggleOnOutlined, MenuBookOutlined,
  SecurityOutlined, BackupOutlined,
} from '@mui/icons-material'
import DashboardStats from '@/components/dashboard/DashboardStats'
import QuickLinkCard from '@/components/admin/QuickLinkCard'

export default function TenantAdminDashboardPage() {
  const params = useParams()
  const slug = params.slug as string

  const QUICK_LINKS = [
    { label: 'Users', description: 'Manage user accounts', icon: <PeopleOutlined />, href: `/site/${slug}/admin/users` },
    { label: 'Settings', description: 'Configure site settings', icon: <SettingsOutlined />, href: `/site/${slug}/admin/settings` },
    { label: 'Feature Toggles', description: 'Enable or disable features', icon: <ToggleOnOutlined />, href: `/site/${slug}/admin/features` },
    { label: 'Menus', description: 'Edit navigation menus', icon: <MenuBookOutlined />, href: `/site/${slug}/admin/menus` },
    { label: 'ACL', description: 'Access control rules', icon: <SecurityOutlined />, href: `/site/${slug}/admin/acl` },
    { label: 'Files', description: 'Manage uploaded files', icon: <FolderOutlined />, href: `/site/${slug}/admin/files` },
    { label: 'Backup', description: 'Export and import data', icon: <BackupOutlined />, href: `/site/${slug}/admin/backup` },
  ]

  return (
    <Box>
      <Typography variant="h3" sx={{ mb: 1 }}>Dashboard</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Overview of your {slug} site.
      </Typography>
      <DashboardStats />
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
