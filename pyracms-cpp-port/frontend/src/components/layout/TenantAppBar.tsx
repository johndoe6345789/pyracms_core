'use client'

import {
  AppBar, Toolbar, Typography,
  Box, Button, IconButton, Divider,
} from '@mui/material'
import {
  MenuOutlined, ArrowBackOutlined,
  LanguageOutlined,
} from '@mui/icons-material'
import Link from 'next/link'
import { NAV_ITEMS } from '@/hooks/useTenantNav'
import {
  GlobalSearch,
} from '@/components/common/GlobalSearch'
import UserBubble
  from '@/components/common/UserBubble'
import NotificationBell
  from '@/components/common/NotificationBell'
import ThemeToggle
  from '@/components/common/ThemeToggle'
import LanguageSelect
  from '@/components/common/LanguageSelect'

interface TenantAppBarProps {
  slug: string
  siteName: string
  isMobile: boolean
  onMenuClick: () => void
}

export default function TenantAppBar({
  slug, siteName, isMobile, onMenuClick,
}: TenantAppBarProps) {
  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Toolbar
        component="nav"
        role="navigation"
        aria-label="Site navigation"
        data-testid="tenant-appbar"
      >
        {isMobile && (
          <IconButton
            edge="start"
            sx={{
              mr: 1,
              color: 'text.primary',
            }}
            onClick={onMenuClick}
            aria-label="Open navigation menu"
            data-testid="menu-toggle"
          >
            <MenuOutlined />
          </IconButton>
        )}
        <Button
          component={Link}
          href="/"
          startIcon={<ArrowBackOutlined />}
          data-testid="portal-link"
          sx={{
            mr: 2,
            color: 'text.secondary',
            display: {
              xs: 'none',
              md: 'inline-flex',
            },
          }}
        >
          Portal
        </Button>
        <LanguageOutlined
          sx={{
            color: 'primary.main',
            mr: 1,
            fontSize: 22,
          }}
          aria-hidden="true"
        />
        <Typography
          variant="h6"
          component={Link}
          href={`/site/${slug}`}
          data-testid="site-name-link"
          sx={{
            color: 'text.primary',
            textDecoration: 'none',
            fontWeight: 700,
            flexGrow: { xs: 1, md: 0 },
            mr: 4,
          }}
        >
          {siteName}
        </Typography>
        {!isMobile && (
          <Box
            sx={{
              display: 'flex',
              gap: 1,
              flexGrow: 1,
            }}
          >
            {NAV_ITEMS.map((item) => (
              <Button
                key={item.path}
                component={Link}
                href={
                  `/site/${slug}/${item.path}`
                }
                startIcon={item.icon}
                data-testid={
                  `nav-${item.path}`
                }
                sx={{
                  color: 'text.secondary',
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>
        )}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: { xs: 0.5, md: 1 },
          }}
        >
          {!isMobile && <GlobalSearch />}
          <LanguageSelect />
          <ThemeToggle />
          <NotificationBell />
          <Divider
            orientation="vertical"
            flexItem
            sx={{
              mx: 0.5,
              display: {
                xs: 'none',
                md: 'block',
              },
            }}
          />
          <UserBubble />
        </Box>
      </Toolbar>
    </AppBar>
  )
}
