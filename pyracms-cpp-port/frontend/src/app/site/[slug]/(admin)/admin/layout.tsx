'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import {
  AppBar, Toolbar, Typography, Box, Button, IconButton, Drawer,
  List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Divider, useMediaQuery, useTheme,
} from '@mui/material'
import Link from 'next/link'
import {
  MenuOutlined, ArrowBackOutlined, DashboardOutlined, PeopleOutlined,
  SettingsOutlined, ToggleOnOutlined, MenuBookOutlined, SecurityOutlined,
  FolderOutlined, BackupOutlined, AdminPanelSettingsOutlined,
  BarChartOutlined, PaletteOutlined, CodeOutlined,
} from '@mui/icons-material'
import NotificationBell from '@/components/common/NotificationBell'
import TenantBreadcrumbs from '@/components/common/TenantBreadcrumbs'
import ThemeToggle from '@/components/common/ThemeToggle'
import LanguageSelect from '@/components/common/LanguageSelect'
import UserBubble from '@/components/common/UserBubble'

const DRAWER_WIDTH = 260

export default function TenantAdminLayout({ children }: { children: React.ReactNode }) {
  const params = useParams()
  const slug = params.slug as string
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [drawerOpen, setDrawerOpen] = useState(false)

  const NAV_ITEMS = [
    { label: 'Dashboard', icon: <DashboardOutlined />, path: `/site/${slug}/admin` },
    { label: 'Users', icon: <PeopleOutlined />, path: `/site/${slug}/admin/users` },
    { label: 'Settings', icon: <SettingsOutlined />, path: `/site/${slug}/admin/settings` },
    { label: 'Feature Toggles', icon: <ToggleOnOutlined />, path: `/site/${slug}/admin/features` },
    { label: 'Menus', icon: <MenuBookOutlined />, path: `/site/${slug}/admin/menus` },
    { label: 'ACL', icon: <SecurityOutlined />, path: `/site/${slug}/admin/acl` },
    { label: 'Files', icon: <FolderOutlined />, path: `/site/${slug}/admin/files` },
    { label: 'Templates', icon: <CodeOutlined />, path: `/site/${slug}/admin/templates` },
    { label: 'Styles', icon: <PaletteOutlined />, path: `/site/${slug}/admin/styles` },
    { label: 'Analytics', icon: <BarChartOutlined />, path: `/site/${slug}/admin/analytics` },
    { label: 'Backup', icon: <BackupOutlined />, path: `/site/${slug}/admin/backup` },
  ]

  const drawerContent = (
    <Box sx={{ width: DRAWER_WIDTH, pt: 2 }}>
      <Box sx={{ px: 2, pb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <AdminPanelSettingsOutlined sx={{ color: 'primary.main' }} />
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Admin</Typography>
      </Box>
      <Divider />
      <List>
        {NAV_ITEMS.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton component={Link} href={item.path} onClick={() => setDrawerOpen(false)}>
              <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton component={Link} href={`/site/${slug}`} onClick={() => setDrawerOpen(false)}>
            <ListItemIcon sx={{ minWidth: 40 }}><ArrowBackOutlined /></ListItemIcon>
            <ListItemText primary="Back to Site" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {isMobile ? (
        <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
          {drawerContent}
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          sx={{
            width: DRAWER_WIDTH, flexShrink: 0,
            '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box', borderRight: '1px solid', borderColor: 'divider' },
          }}
        >
          {drawerContent}
        </Drawer>
      )}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}>
          <Toolbar>
            {isMobile && (
              <IconButton edge="start" sx={{ mr: 1, color: 'text.primary' }} onClick={() => setDrawerOpen(true)}>
                <MenuOutlined />
              </IconButton>
            )}
            <AdminPanelSettingsOutlined sx={{ color: 'primary.main', mr: 1, fontSize: 22 }} />
            <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 700, flexGrow: 1 }}>
              {slug} Admin
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, md: 1 } }}>
              <LanguageSelect />
              <ThemeToggle />
              <NotificationBell />
              <UserBubble />
              <Button component={Link} href={`/site/${slug}`} startIcon={<ArrowBackOutlined />} sx={{ color: 'text.secondary', ml: 1 }}>
                Site
              </Button>
            </Box>
          </Toolbar>
        </AppBar>
        <Box sx={{ p: { xs: 2, md: 4 }, flexGrow: 1 }}>
          <TenantBreadcrumbs />
          {children}
        </Box>
      </Box>
    </Box>
  )
}
