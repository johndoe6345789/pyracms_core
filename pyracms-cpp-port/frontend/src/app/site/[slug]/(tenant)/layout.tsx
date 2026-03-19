'use client'

import { Box, Container, useMediaQuery, useTheme } from '@mui/material'
import TenantAppBar from '@/components/layout/TenantAppBar'
import TenantDrawer from '@/components/layout/TenantDrawer'
import TenantBreadcrumbs from '@/components/common/TenantBreadcrumbs'
import { useTenantNav } from '@/hooks/useTenantNav'

export default function TenantSiteLayout({ children }: { children: React.ReactNode }) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const { slug, siteName, drawerOpen, openDrawer, closeDrawer } = useTenantNav()

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <TenantAppBar slug={slug} siteName={siteName} isMobile={isMobile} onMenuClick={openDrawer} />
      <TenantDrawer slug={slug} siteName={siteName} open={drawerOpen} onClose={closeDrawer} />
      <Container maxWidth="lg" disableGutters sx={{ px: { xs: 2, md: 3 } }}>
        <TenantBreadcrumbs />
      </Container>
      <Box>{children}</Box>
    </Box>
  )
}
