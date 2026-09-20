'use client'

import { Container, Typography, Box } from '@mui/material'
import TenantModuleCards from '@/components/layout/TenantModuleCards'
import SiteNotFound from '@/components/layout/SiteNotFound'
import { useTenantNav } from '@/hooks/useTenantNav'
import RecentActivity from '@/components/activity/RecentActivity'
import { useTenant } from '@/hooks/useTenant'

const welcome = (name: string) =>
  `Welcome to ${name}. Explore the modules below to get started with ` +
  'articles, forums, galleries, games, code and more.'

export default function SiteHomePage() {
  const { slug, siteName, tenant, canAdmin } = useTenantNav()
  const { notFound } = useTenant(slug)

  if (notFound) return <SiteNotFound slug={slug} />

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 6 } }}>
      <Box sx={{ mb: 6 }}>
        <Typography
          variant="h2"
          component="h1"
          gutterBottom
          sx={{ color: 'text.primary' }}
        >
          {siteName}
        </Typography>
        <Typography
          variant="body1"
          sx={{ color: 'text.secondary', maxWidth: 600 }}
        >
          {tenant?.description || welcome(siteName)}
        </Typography>
      </Box>
      <TenantModuleCards slug={slug} canAdmin={canAdmin} />
      <RecentActivity tenantId={tenant?.id ?? null} />
    </Container>
  )
}
