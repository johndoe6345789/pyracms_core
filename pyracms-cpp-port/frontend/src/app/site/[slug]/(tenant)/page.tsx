'use client'

import { Container, Typography, Box, Alert, Button } from '@mui/material'
import Link from 'next/link'
import TenantModuleCards from '@/components/layout/TenantModuleCards'
import { useTenantNav } from '@/hooks/useTenantNav'
import { useTenant } from '@/hooks/useTenant'

export default function SiteHomePage() {
  const { slug, siteName, tenant, canAdmin } = useTenantNav()
  const { notFound } = useTenant(slug)

  if (notFound) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Alert
          severity="warning"
          action={
            <Button component={Link} href="/" color="inherit" size="small">
              Portal
            </Button>
          }
        >
          There is no site called <strong>{slug}</strong>.
        </Alert>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box sx={{ mb: 6 }}>
        <Typography variant="h2" component="h1" gutterBottom sx={{ color: 'text.primary' }}>
          {siteName}
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 600 }}>
          {tenant?.description
            || `Welcome to ${siteName}. Explore the modules below to get started with articles, forums, galleries, games, code and more.`}
        </Typography>
      </Box>
      <TenantModuleCards slug={slug} canAdmin={canAdmin} />
    </Container>
  )
}
