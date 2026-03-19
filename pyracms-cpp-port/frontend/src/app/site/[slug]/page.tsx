'use client'

import { useParams } from 'next/navigation'
import { Container, Typography, Box } from '@mui/material'
import TenantModuleCards from '@/components/layout/TenantModuleCards'

export default function SiteHomePage() {
  const params = useParams()
  const slug = params.slug as string
  const siteName = slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box sx={{ mb: 6 }}>
        <Typography variant="h2" component="h1" gutterBottom sx={{ color: 'text.primary' }}>
          {siteName}
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 600 }}>
          Welcome to {siteName}. Explore the modules below to get started with
          articles, forums, galleries, and more.
        </Typography>
      </Box>
      <TenantModuleCards slug={slug} />
    </Container>
  )
}
