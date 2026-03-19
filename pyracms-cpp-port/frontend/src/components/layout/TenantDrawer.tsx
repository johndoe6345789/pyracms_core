'use client'

import {
  Drawer, Box, Typography, Divider, List, ListItem, ListItemButton,
  ListItemIcon, ListItemText,
} from '@mui/material'
import { ArrowBackOutlined } from '@mui/icons-material'
import Link from 'next/link'
import { NAV_ITEMS } from '@/hooks/useTenantNav'

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
        <Box sx={{ px: 2, pb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>{siteName}</Typography>
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
