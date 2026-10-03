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
  const { config, loading: configLoading, error: configError } = useDomainConfig()

  // If this domain is bound to a single site, redirect to that site
  useEffect(() => {
    if (config && !configLoading && config.displayMode === 'single' && config.slug) {
      console.log(`[PortalPage] Redirecting to /site/${config.slug}`)
      router.push(`/site/${config.slug}`)
    }
  }, [config, configLoading, router])

  // Show loading state while checking domain config
  if (configLoading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ textAlign: 'center' }}>
          <div>Loading domain config...</div>
          <div style={{ fontSize: '12px', marginTop: '10px', color: '#666' }}>
            {typeof window !== 'undefined' && (
              <>Domain: {window.location.hostname}</>
            )}
          </div>
        </Box>
      </Box>
    )
  }

  // Show debug info if there's an error
  if (configError) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
        <Box sx={{ textAlign: 'center', backgroundColor: '#fee', padding: 2, borderRadius: 1 }}>
          <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>Error loading domain config</div>
          <div style={{ fontSize: '14px', marginBottom: '10px' }}>{configError}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            Open browser console (F12) to see more details
          </div>
        </Box>
      </Box>
    )
  }

  // If single-site mode, the redirect above will handle it
  if (config?.displayMode === 'single') {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ textAlign: 'center' }}>
          <div>Redirecting to {config.slug}...</div>
          <div style={{ fontSize: '12px', marginTop: '10px', color: '#666' }}>
            (displayMode: {config.displayMode})
          </div>
        </Box>
      </Box>
    )
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
