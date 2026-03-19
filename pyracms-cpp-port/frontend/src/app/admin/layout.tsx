'use client'

import { useState } from 'react'
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import Link from 'next/link'
import {
  MenuOutlined,
  ArrowBackOutlined,
  DashboardOutlined,
  PeopleOutlined,
  SettingsOutlined,
  ToggleOnOutlined,
  MenuBookOutlined,
  SecurityOutlined,
  FolderOutlined,
  BackupOutlined,
  AdminPanelSettingsOutlined,
} from '@mui/icons-material'

const DRAWER_WIDTH = 260

const NAV_ITEMS = [
  { label: 'Dashboard', icon: <DashboardOutlined />, path: '/admin' },
  { label: 'Users', icon: <PeopleOutlined />, path: '/admin/users' },
  { label: 'Settings', icon: <SettingsOutlined />, path: '/admin/settings' },
  { label: 'Feature Toggles', icon: <ToggleOnOutlined />, path: '/admin/features' },
  { label: 'Menus', icon: <MenuBookOutlined />, path: '/admin/menus' },
  { label: 'ACL', icon: <SecurityOutlined />, path: '/admin/acl' },
  { label: 'Files', icon: <FolderOutlined />, path: '/admin/files' },
  { label: 'Backup', icon: <BackupOutlined />, path: '/admin/backup' },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [drawerOpen, setDrawerOpen] = useState(false)

  const drawerContent = (
    <Box sx={{ width: DRAWER_WIDTH, pt: 2 }}>
      <Box sx={{ px: 2, pb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <AdminPanelSettingsOutlined sx={{ color: 'primary.main' }} />
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Admin
        </Typography>
      </Box>
      <Divider />
      <List>
        {NAV_ITEMS.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              component={Link}
              href={item.path}
              onClick={() => setDrawerOpen(false)}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton
            component={Link}
            href="/"
            onClick={() => setDrawerOpen(false)}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <ArrowBackOutlined />
            </ListItemIcon>
            <ListItemText primary="Back to Portal" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Sidebar */}
      {isMobile ? (
        <Drawer
          anchor="left"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
        >
          {drawerContent}
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              borderRight: '1px solid',
              borderColor: 'divider',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Main content */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: 'background.paper',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Toolbar>
            {isMobile && (
              <IconButton
                edge="start"
                sx={{ mr: 1, color: 'text.primary' }}
                onClick={() => setDrawerOpen(true)}
              >
                <MenuOutlined />
              </IconButton>
            )}
            <AdminPanelSettingsOutlined
              sx={{ color: 'primary.main', mr: 1, fontSize: 22 }}
            />
            <Typography
              variant="h6"
              sx={{ color: 'text.primary', fontWeight: 700, flexGrow: 1 }}
            >
              PyraCMS Admin
            </Typography>
            <Button
              component={Link}
              href="/"
              startIcon={<ArrowBackOutlined />}
              sx={{ color: 'text.secondary' }}
            >
              Portal
            </Button>
          </Toolbar>
        </AppBar>

        <Box sx={{ p: { xs: 2, md: 4 }, flexGrow: 1 }}>{children}</Box>
      </Box>
    </Box>
  )
}
