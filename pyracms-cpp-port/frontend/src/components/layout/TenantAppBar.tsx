'use client'

import { AppBar, Toolbar, Typography, Box, Button, IconButton } from '@mui/material'
import { MenuOutlined, ArrowBackOutlined, LanguageOutlined } from '@mui/icons-material'
import Link from 'next/link'
import { NAV_ITEMS } from '@/hooks/useTenantNav'

interface TenantAppBarProps {
  slug: string
  siteName: string
  isMobile: boolean
  onMenuClick: () => void
}

export default function TenantAppBar({ slug, siteName, isMobile, onMenuClick }: TenantAppBarProps) {
  return (
    <AppBar position="sticky" elevation={0} sx={{
      bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider',
    }}>
      <Toolbar>
        {isMobile && (
          <IconButton edge="start" sx={{ mr: 1, color: 'text.primary' }} onClick={onMenuClick}>
            <MenuOutlined />
          </IconButton>
        )}
        <Button component={Link} href="/" startIcon={<ArrowBackOutlined />}
          sx={{ mr: 2, color: 'text.secondary', display: { xs: 'none', md: 'inline-flex' } }}>
          Portal
        </Button>
        <LanguageOutlined sx={{ color: 'primary.main', mr: 1, fontSize: 22 }} />
        <Typography variant="h6" component={Link} href={`/site/${slug}`}
          sx={{ color: 'text.primary', textDecoration: 'none', fontWeight: 700,
            flexGrow: { xs: 1, md: 0 }, mr: 4 }}>
          {siteName}
        </Typography>
        {!isMobile && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            {NAV_ITEMS.map((item) => (
              <Button key={item.path} component={Link} href={`/site/${slug}/${item.path}`}
                startIcon={item.icon} sx={{ color: 'text.secondary' }}>
                {item.label}
              </Button>
            ))}
          </Box>
        )}
      </Toolbar>
    </AppBar>
  )
}
