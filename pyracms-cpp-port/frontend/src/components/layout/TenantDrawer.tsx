'use client'

import {
  Drawer, Box, Typography, Divider, List, ListItem, ListItemButton,
  ListItemIcon, ListItemText,
} from '@mui/material'
import { ArrowBackOutlined, SearchOutlined, AdminPanelSettingsOutlined } from '@mui/icons-material'
import Link from 'next/link'
import { NAV_ITEMS } from '@/hooks/useTenantNav'
import UserBubble from '@/components/common/UserBubble'

interface TenantDrawerProps {
  slug: string
  siteName: string
  open: boolean
  onClose: () => void
}

export default function TenantDrawer({ slug, siteName, open, onClose }: TenantDrawerProps) {
  return (
    <Drawer anchor="left" open={open} onClose={onClose}>
      <Box sx={{ width: 260, pt: 2 }}>
        <Box sx={{ px: 2, pb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>{siteName}</Typography>
          <UserBubble />
        </Box>
        <Divider />
        <List>
          {NAV_ITEMS.map((item) => (
            <ListItem key={item.path} disablePadding>
              <ListItemButton component={Link} href={`/site/${slug}/${item.path}`} onClick={onClose}>
                <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Divider />
        <List>
          <ListItem disablePadding>
            <ListItemButton component={Link} href="/search" onClick={onClose}>
              <ListItemIcon sx={{ minWidth: 40 }}><SearchOutlined /></ListItemIcon>
              <ListItemText primary="Search" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton component={Link} href={`/site/${slug}/admin`} onClick={onClose}>
              <ListItemIcon sx={{ minWidth: 40 }}><AdminPanelSettingsOutlined /></ListItemIcon>
              <ListItemText primary="Admin" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton component={Link} href="/" onClick={onClose}>
              <ListItemIcon sx={{ minWidth: 40 }}><ArrowBackOutlined /></ListItemIcon>
              <ListItemText primary="Back to Portal" />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Drawer>
  )
}
