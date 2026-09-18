'use client'

import {
  Drawer, Box, Typography, IconButton, List, ListItem, ListItemButton,
  ListItemIcon, ListItemText, Button, Divider,
} from '@mui/material'
import { CloseOutlined, LanguageOutlined } from '@mui/icons-material'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { isActive, type NavSection } from './navTypes'

interface Props {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string | undefined
  sections: NavSection[]
  /** Secondary action pinned to the bottom (e.g. back to portal) */
  footer?: { label: string; href: string; icon: React.ReactNode }
  testId?: string
}

/**
 * Burger drawer shared by the portal and every site: gradient masthead,
 * grouped destinations with an active accent, pinned footer action.
 */
export default function AppDrawer({
  open, onClose, title, subtitle, sections, footer,
  testId = 'tenant-drawer',
}: Props) {
  const pathname = usePathname() ?? ''
  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      data-testid={testId}
      slotProps={{
        paper: {
          sx: {
            width: { xs: '86vw', sm: 320 },
            maxWidth: 360,
            borderTopRightRadius: 24,
            borderBottomRightRadius: 24,
            backgroundImage: 'none',
            display: 'flex',
            flexDirection: 'column',
          },
        },
      }}
    >
      <Box
        sx={{
          background:
            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          px: 2.5,
          pt: 3,
          pb: 2.5,
          position: 'relative',
        }}
      >
        <IconButton
          onClick={onClose}
          aria-label="Close navigation menu"
          sx={{ position: 'absolute', top: 8, right: 8, color: 'white' }}
        >
          <CloseOutlined />
        </IconButton>
        <LanguageOutlined sx={{ fontSize: 32, mb: 1, opacity: 0.9 }} />
        <Typography variant="h5" sx={{ fontWeight: 800, pr: 4 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" sx={{ opacity: 0.85, mt: 0.5 }}>
            {subtitle}
          </Typography>
        )}
      </Box>

      <Box sx={{ flexGrow: 1, overflowY: 'auto', py: 1 }}>
        {sections.map((section, i) => (
          <Box
            key={section.title ?? i}
            component="nav"
            aria-label={section.title ?? 'Navigation'}
            sx={{ px: 1.5, py: 0.5 }}
          >
            {section.title && (
              <Typography
                variant="overline"
                color="text.secondary"
                sx={{ px: 1.5, fontWeight: 700, letterSpacing: '.08em' }}
              >
                {section.title}
              </Typography>
            )}
            <List
              disablePadding
              data-testid={i === 0 ? 'drawer-nav-list' : undefined}
            >
              {section.items.map((item) => {
                const active = isActive(pathname, item)
                return (
                  <ListItem key={item.key} disablePadding sx={{ mb: 0.25 }}>
                    <ListItemButton
                      component={Link}
                      href={item.href}
                      onClick={onClose}
                      selected={active}
                      aria-current={active ? 'page' : undefined}
                      data-testid={
                        item.testId
                          ? `drawer-${item.testId}`
                          : `drawer-nav-${item.key}`
                      }
                      sx={{
                        borderRadius: '12px',
                        position: 'relative',
                        '&.Mui-selected': {
                          bgcolor: 'action.selected',
                          color: 'primary.main',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            left: 0,
                            top: 10,
                            bottom: 10,
                            width: 3,
                            borderRadius: 3,
                            bgcolor: 'primary.main',
                          },
                        },
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 40,
                          color: active ? 'primary.main' : 'text.secondary',
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={item.label}
                        slotProps={{
                          primary: {
                            sx: { fontWeight: active ? 700 : 500 },
                          },
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                )
              })}
            </List>
          </Box>
        ))}
      </Box>

      {footer && (
        <>
          <Divider />
          <Box sx={{ p: 2 }}>
            <Button
              component={Link}
              href={footer.href}
              onClick={onClose}
              fullWidth
              variant="outlined"
              startIcon={footer.icon}
              data-testid="drawer-portal"
            >
              {footer.label}
            </Button>
          </Box>
        </>
      )}
    </Drawer>
  )
}
