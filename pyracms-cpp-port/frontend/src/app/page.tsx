'use client'

import { Box } from '@mui/material'
import PortalShell from '@/components/layout/PortalShell'
import SiteFooter from '@/components/layout/SiteFooter'
import HeroSection from '@/components/portal/HeroSection'
import TenantGrid from '@/components/portal/TenantGrid'
import { useTenantList } from '@/hooks/useTenantList'

export default function PortalPage() {
  const { sites, loading } = useTenantList()

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
      }}
      data-testid="portal-page"
      role="main"
      aria-label="Portal homepage"
    >
      <PortalShell />
      <HeroSection />
      <TenantGrid sites={sites} loading={loading} />
      <SiteFooter />
    </Box>
  )
}
