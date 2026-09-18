import Link from 'next/link'
import {
  Box, Typography, List, ListItem,
  ListItemButton, ListItemIcon,
  ListItemText, Divider,
} from '@mui/material'
import {
  ArrowBackOutlined,
  AdminPanelSettingsOutlined,
} from '@mui/icons-material'
import { buildAdminNavItems } from './adminNavItems'

export const DRAWER_WIDTH = 260

interface Props {
  slug: string
  onNavigate: () => void
}

export default function AdminDrawerContent({
  slug,
  onNavigate,
}: Props) {
  const items = buildAdminNavItems(slug)
  return (
    <Box sx={{ width: DRAWER_WIDTH, pt: 2 }}>
      <Box
        sx={{
          px: 2, pb: 2, display: 'flex',
          alignItems: 'center', gap: 1,
        }}
      >
        <AdminPanelSettingsOutlined
          sx={{ color: 'primary.main' }}
          aria-hidden="true"
        />
        <Typography
          variant="h5"
          sx={{ fontWeight: 700 }}
        >
          Admin
        </Typography>
      </Box>
      <Divider />
      <nav
        aria-label="Admin navigation"
        role="navigation"
      >
        <List data-testid="admin-nav-list">
          {items.map((item) => (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                component={Link}
                href={item.path}
                onClick={onNavigate}
                data-testid={`admin-nav-${item.label
                  .toLowerCase()
                  .replace(/\s+/g, '-')}`}
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
      <nav
        aria-label="Admin secondary navigation"
        role="navigation"
      >
        <List>
          <ListItem disablePadding>
            <ListItemButton
              component={Link}
              href={`/site/${slug}`}
              onClick={onNavigate}
              data-testid="admin-back-to-site"
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <ArrowBackOutlined />
              </ListItemIcon>
              <ListItemText primary="Back to Site" />
            </ListItemButton>
          </ListItem>
        </List>
      </nav>
    </Box>
  )
}
