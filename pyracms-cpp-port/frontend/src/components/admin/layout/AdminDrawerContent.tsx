import Link from 'next/link'
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material'
import { ArrowBackOutlined } from '@mui/icons-material'
import { buildAdminNavItems } from './adminNavItems'
import AdminDrawerHeader from './AdminDrawerHeader'

export const DRAWER_WIDTH = 260

interface Props {
  slug: string
  onNavigate: () => void
}

export default function AdminDrawerContent({ slug, onNavigate }: Props) {
  const items = buildAdminNavItems(slug)
  return (
    <Box sx={{ width: DRAWER_WIDTH, pt: 2 }}>
      <AdminDrawerHeader />
      <Divider />
      <nav aria-label="Admin navigation" role="navigation">
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
                <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </nav>
      <Divider />
      <nav aria-label="Admin secondary navigation" role="navigation">
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
