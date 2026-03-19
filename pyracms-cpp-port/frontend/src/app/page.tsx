'use client'

import { Box } from '@mui/material'
import HeroSection from '@/components/portal/HeroSection'
import TenantGrid from '@/components/portal/TenantGrid'
import { useTenantList } from '@/hooks/useTenantList'

export default function PortalPage() {
  const { sites, loading } = useTenantList()

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <HeroSection />
      <TenantGrid sites={sites} loading={loading} />
    </Box>
  )
}
