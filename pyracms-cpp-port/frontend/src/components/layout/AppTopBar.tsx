'use client'

import {
  AppBar, Toolbar, Typography, Box, Button, Divider,
} from '@mui/material'
import { LanguageOutlined } from '@mui/icons-material'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { GlobalSearch } from '@/components/common/GlobalSearch'
import UserBubble from '@/components/common/UserBubble'
import NotificationBell from '@/components/common/NotificationBell'
import ThemeToggle from '@/components/common/ThemeToggle'
import LanguageSelect from '@/components/common/LanguageSelect'
import MenuToggle from './MenuToggle'
import { isActive, type NavEntry } from './navTypes'

interface Props {
  brand: string
  brandHref: string
  /** Inline links shown from the `lg` breakpoint up */
  items: NavEntry[]
  drawerOpen: boolean
  onMenuClick: () => void
  navLabel: string
}

/**
 * The one top bar used by the portal and by every site. Burger on the
 * left (always), brand, inline links on wide screens, tools on the right.
 */
export default function AppTopBar({
  brand, brandHref, items, drawerOpen, onMenuClick, navLabel,
}: Props) {
  const pathname = usePathname() ?? ''
  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
        backgroundImage: 'none',
      }}
    >
      <Toolbar
        component="nav"
        role="navigation"
        aria-label={navLabel}
        data-testid="tenant-appbar"
      >
        <MenuToggle open={drawerOpen} onClick={onMenuClick} />
        <LanguageOutlined
          sx={{ color: 'primary.main', mr: 1, fontSize: 22 }}
          aria-hidden="true"
        />
        <Typography
          variant="h6"
          component={Link}
          href={brandHref}
          data-testid="site-name-link"
          sx={{
            color: 'text.primary',
            textDecoration: 'none',
            fontWeight: 800,
            flexGrow: { xs: 1, lg: 0 },
            mr: { lg: 3 },
            whiteSpace: 'nowrap',
          }}
        >
          {brand}
        </Typography>
        <Box
          sx={{
            display: { xs: 'none', lg: 'flex' },
            gap: 0.5,
            flexGrow: 1,
          }}
        >
          {items.map((item) => {
            const active = isActive(pathname, item)
            return (
              <Button
                key={item.key}
                component={Link}
                href={item.href}
                startIcon={item.icon}
                data-testid={item.testId ?? `nav-${item.key}`}
                aria-current={active ? 'page' : undefined}
                sx={{
                  color: active ? 'primary.main' : 'text.secondary',
                  bgcolor: active ? 'action.selected' : 'transparent',
                  px: 1.5,
                }}
              >
                {item.label}
              </Button>
            )
          })}
        </Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: { xs: 0.5, md: 1 },
          }}
        >
          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
            <GlobalSearch />
          </Box>
          <LanguageSelect />
          <ThemeToggle />
          <NotificationBell />
          <Divider
            orientation="vertical"
            flexItem
            sx={{ mx: 0.5, display: { xs: 'none', md: 'block' } }}
          />
          <UserBubble />
        </Box>
      </Toolbar>
    </AppBar>
  )
}
