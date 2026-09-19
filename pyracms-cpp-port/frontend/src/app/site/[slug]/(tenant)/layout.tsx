'use client'

import { Box, Container } from '@mui/material'
import TenantAppBar from '@/components/layout/TenantAppBar'
import TenantDrawer from '@/components/layout/TenantDrawer'
import SiteFooter from '@/components/layout/SiteFooter'
import ForkRibbon from '@/components/common/ForkRibbon'
import SkipLink from '@/components/layout/SkipLink'
import TenantBreadcrumbs from '@/components/common/TenantBreadcrumbs'
import { useTenantNav } from '@/hooks/useTenantNav'

export default function TenantSiteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const {
    slug, siteName, tenant, canAdmin,
    drawerOpen, toggleDrawer, closeDrawer,
  } = useTenantNav()

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <SkipLink />
      <TenantAppBar
        slug={slug}
        siteName={siteName}
        drawerOpen={drawerOpen}
        onMenuClick={toggleDrawer}
      />
      <TenantDrawer
        slug={slug}
        siteName={siteName}
        description={tenant?.description}
        canAdmin={canAdmin}
        open={drawerOpen}
        onClose={closeDrawer}
      />
      <Box sx={{ position: 'relative' }}>
        <ForkRibbon size={48} />
        <Container
          maxWidth="lg"
          disableGutters
          sx={{ px: { xs: 2, md: 3 }, pr: { xs: 8, md: 9 }, minHeight: 48 }}
        >
          <TenantBreadcrumbs />
        </Container>
      </Box>
      <Box
        component="main"
        id="main-content"
        tabIndex={-1}
        data-testid="main-content"
      >
        {children}
      </Box>
      <SiteFooter downloadHref={`/site/${slug}/download`} />
    </Box>
  )
}
