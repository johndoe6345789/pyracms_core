'use client'

import { Container, Typography, Grid } from '@mui/material'
import TenantCard from './TenantCard'
import SkeletonCard from './SkeletonCard'
import type { Site } from '@/hooks/useTenantList'

interface TenantGridProps {
  sites: Site[]
  loading: boolean
}

export default function TenantGrid({ sites, loading }: TenantGridProps) {
  return (
    <Container id="sites" maxWidth="lg" sx={{ py: 8, scrollMarginTop: 64 }}>
      <Typography
        variant="h3" component="h2"
        sx={{ mb: 1, color: 'text.primary' }}
      >
        Available Sites
      </Typography>
      <Typography
        variant="body1"
        sx={{ mb: 5, color: 'text.secondary', maxWidth: 600 }}
      >
        Browse community sites or jump into one you manage.
      </Typography>
      <Grid container spacing={3}>
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <SkeletonCard />
              </Grid>
            ))
          : sites.map((site) => (
              <Grid item xs={12} sm={6} md={4} key={site.slug}>
                <TenantCard site={site} />
              </Grid>
            ))}
      </Grid>
    </Container>
  )
}
