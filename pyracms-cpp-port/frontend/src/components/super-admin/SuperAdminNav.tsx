'use client'

import {
  Box, List, ListItem, ListItemButton,
  ListItemIcon, ListItemText, Divider,
  Typography,
} from '@mui/material'
import {
  DashboardOutlined, DnsOutlined,
  PeopleOutlined, TuneOutlined,
  ShieldOutlined,
} from '@mui/icons-material'
import Link from 'next/link'

const NAV_ITEMS = [
  { label: 'Dashboard', icon: <DashboardOutlined />, path: '/super-admin' },
  { label: 'Tenants', icon: <DnsOutlined />, path: '/super-admin/tenants' },
  { label: 'Users', icon: <PeopleOutlined />, path: '/super-admin/users' },
  { label: 'Settings', icon: <TuneOutlined />, path: '/super-admin/settings' },
]

interface Props { width: number; onNavClick?: () => void }

export default function SuperAdminNav({
  width, onNavClick,
}: Props) {
  return (
    <Box sx={{ width, pt: 2 }}>
      <Box
        sx={{ px: 2, pb: 2, display: 'flex', alignItems: 'center', gap: 1 }}
      >
        <ShieldOutlined
          sx={{ color: 'warning.main' }}
          aria-hidden="true"
        />
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Super Admin
        </Typography>
      </Box>
      <Divider />
      <nav aria-label="Super admin navigation">
        <List data-testid="super-admin-nav-list">
          {NAV_ITEMS.map((item) => (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                component={Link}
                href={item.path}
                onClick={onNavClick}
                data-testid={
                  `super-admin-nav-${item.label.toLowerCase()}`
                }
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </nav>
      <Divider />
      <nav aria-label="Super admin secondary navigation">
        <List>
          <ListItem disablePadding>
            <ListItemButton
              component={Link}
              href="/"
              data-testid="super-admin-back-portal"
            >
              <ListItemText
                primary="Back to Portal"
                primaryTypographyProps={{
                  color: 'text.secondary',
                  fontSize: '0.875rem',
                }}
              />
            </ListItemButton>
          </ListItem>
        </List>
      </nav>
    </Box>
  )
}
