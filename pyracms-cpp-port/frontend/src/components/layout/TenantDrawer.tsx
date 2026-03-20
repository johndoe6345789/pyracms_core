'use client'

import {
  Drawer, Box, Typography, Divider,
  List, ListItem, ListItemButton,
  ListItemIcon, ListItemText,
} from '@mui/material'
import {
  ArrowBackOutlined, SearchOutlined,
  AdminPanelSettingsOutlined,
} from '@mui/icons-material'
import Link from 'next/link'
import { NAV_ITEMS } from '@/hooks/useTenantNav'
import UserBubble
  from '@/components/common/UserBubble'

interface TenantDrawerProps {
  slug: string
  siteName: string
  open: boolean
  onClose: () => void
}

export default function TenantDrawer({
  slug, siteName, open, onClose,
}: TenantDrawerProps) {
  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      data-testid="tenant-drawer"
    >
      <Box sx={{ width: 260, pt: 2 }}>
        <Box
          sx={{
            px: 2,
            pb: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography
            variant="h5"
            sx={{ fontWeight: 700 }}
          >
            {siteName}
          </Typography>
          <UserBubble />
        </Box>
        <Divider />
        <nav
          aria-label="Site navigation"
          role="navigation"
        >
          <List data-testid="drawer-nav-list">
            {NAV_ITEMS.map((item) => (
              <ListItem
                key={item.path}
                disablePadding
              >
                <ListItemButton
                  component={Link}
                  href={
                    `/site/${slug}/${item.path}`
                  }
                  onClick={onClose}
                  data-testid={
                    `drawer-nav-${item.path}`
                  }
                >
                  <ListItemIcon
                    sx={{ minWidth: 40 }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </nav>
        <Divider />
        <nav
          aria-label="Secondary navigation"
          role="navigation"
        >
          <List
            data-testid="drawer-secondary-list"
          >
            <ListItem disablePadding>
              <ListItemButton
                component={Link}
                href="/search"
                onClick={onClose}
                data-testid="drawer-search"
              >
                <ListItemIcon
                  sx={{ minWidth: 40 }}
                >
                  <SearchOutlined />
                </ListItemIcon>
                <ListItemText
                  primary="Search"
                />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                component={Link}
                href={
                  `/site/${slug}/admin`
                }
                onClick={onClose}
                data-testid="drawer-admin"
              >
                <ListItemIcon
                  sx={{ minWidth: 40 }}
                >
                  <AdminPanelSettingsOutlined />
                </ListItemIcon>
                <ListItemText
                  primary="Admin"
                />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                component={Link}
                href="/"
                onClick={onClose}
                data-testid="drawer-portal"
              >
                <ListItemIcon
                  sx={{ minWidth: 40 }}
                >
                  <ArrowBackOutlined />
                </ListItemIcon>
                <ListItemText
                  primary="Back to Portal"
                />
              </ListItemButton>
            </ListItem>
          </List>
        </nav>
      </Box>
    </Drawer>
  )
}
