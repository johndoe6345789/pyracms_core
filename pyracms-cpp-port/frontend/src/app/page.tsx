'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Box } from '@mui/material'
import PortalShell from '@/components/layout/PortalShell'
import SiteFooter from '@/components/layout/SiteFooter'
import HeroSection from '@/components/portal/HeroSection'
import TenantGrid from '@/components/portal/TenantGrid'
import { useTenantList } from '@/hooks/useTenantList'
import { useDomainConfig } from '@/hooks/useDomainConfig'

export default function PortalPage() {
  const router = useRouter()
  const { sites, loading: sitesLoading } = useTenantList()
  const { config, loading: configLoading } = useDomainConfig()

  // If this domain is bound to a single site, redirect to that site
  useEffect(() => {
    if (config && !configLoading && config.displayMode === 'single' && config.slug) {
      router.push(`/site/${config.slug}`)
    }
  }, [config, configLoading, router])

  // Show loading state while checking domain config
  if (configLoading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        Loading...
      </Box>
    )
  }

  // If single-site mode, the redirect above will handle it
  if (config?.displayMode === 'single') {
    return null
  }

  // Multi-site mode: show splash screen with all sites
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
      <TenantGrid sites={sites} loading={sitesLoading} />
      <SiteFooter />
    </Box>
  )
}
