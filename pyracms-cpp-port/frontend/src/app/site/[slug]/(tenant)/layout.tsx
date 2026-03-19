'use client'

import {
  Box, Container,
  useMediaQuery, useTheme,
} from '@mui/material'
import TenantAppBar
  from '@/components/layout/TenantAppBar'
import TenantDrawer
  from '@/components/layout/TenantDrawer'
import TenantBreadcrumbs
  from '@/components/common/TenantBreadcrumbs'
import {
  useTenantNav,
} from '@/hooks/useTenantNav'

export default function TenantSiteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const theme = useTheme()
  const isMobile = useMediaQuery(
    theme.breakpoints.down('md'),
  )
  const {
    slug, siteName,
    drawerOpen, openDrawer, closeDrawer,
  } = useTenantNav()

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
      }}
    >
      <a
        href="#main-content"
        className="skip-to-content"
        data-testid="skip-to-content"
        style={{
          position: 'absolute',
          left: '-9999px',
          top: 'auto',
          width: '1px',
          height: '1px',
          overflow: 'hidden',
          zIndex: 9999,
        }}
        onFocus={(e) => {
          e.currentTarget.style.position
            = 'fixed'
          e.currentTarget.style.left
            = '16px'
          e.currentTarget.style.top
            = '16px'
          e.currentTarget.style.width
            = 'auto'
          e.currentTarget.style.height
            = 'auto'
          e.currentTarget.style.overflow
            = 'visible'
          e.currentTarget.style.background
            = '#fff'
          e.currentTarget.style.padding
            = '8px 16px'
          e.currentTarget.style.border
            = '2px solid #1976d2'
          e.currentTarget.style.borderRadius
            = '4px'
          e.currentTarget.style.color
            = '#1976d2'
          e.currentTarget.style.fontWeight
            = '700'
          e.currentTarget.style.textDecoration
            = 'none'
        }}
        onBlur={(e) => {
          e.currentTarget.style.position
            = 'absolute'
          e.currentTarget.style.left
            = '-9999px'
          e.currentTarget.style.width
            = '1px'
          e.currentTarget.style.height
            = '1px'
          e.currentTarget.style.overflow
            = 'hidden'
        }}
      >
        Skip to main content
      </a>
      <TenantAppBar
        slug={slug}
        siteName={siteName}
        isMobile={isMobile}
        onMenuClick={openDrawer}
      />
      <TenantDrawer
        slug={slug}
        siteName={siteName}
        open={drawerOpen}
        onClose={closeDrawer}
      />
      <Container
        maxWidth="lg"
        disableGutters
        sx={{ px: { xs: 2, md: 3 } }}
      >
        <TenantBreadcrumbs />
      </Container>
      <Box
        component="main"
        id="main-content"
        tabIndex={-1}
        data-testid="main-content"
      >
        {children}
      </Box>
    </Box>
  )
}
