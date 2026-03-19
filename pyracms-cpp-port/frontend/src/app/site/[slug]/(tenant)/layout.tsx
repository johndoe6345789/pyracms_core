'use client'

import { Box, useMediaQuery, useTheme } from '@mui/material'
import TenantAppBar from '@/components/layout/TenantAppBar'
import TenantDrawer from '@/components/layout/TenantDrawer'
import { useTenantNav } from '@/hooks/useTenantNav'

export default function TenantSiteLayout({ children }: { children: React.ReactNode }) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const { slug, siteName, drawerOpen, openDrawer, closeDrawer } = useTenantNav()

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <TenantAppBar slug={slug} siteName={siteName} isMobile={isMobile} onMenuClick={openDrawer} />
      <TenantDrawer slug={slug} siteName={siteName} open={drawerOpen} onClose={closeDrawer} />
      <Box>{children}</Box>
    </Box>
  )
}
