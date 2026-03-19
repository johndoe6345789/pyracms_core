'use client'

import { Container, Typography, Grid, Card, CardContent, Skeleton } from '@mui/material'
import TenantCard from './TenantCard'
import type { Site } from '@/hooks/useTenantList'

interface TenantGridProps {
  sites: Site[]
  loading: boolean
}

function SkeletonCard() {
  return (
    <Card variant="outlined" sx={{ height: '100%', borderColor: 'divider' }}>
      <CardContent>
        <Skeleton variant="text" width="60%" height={32} />
        <Skeleton variant="text" width="100%" />
        <Skeleton variant="text" width="80%" />
        <Skeleton variant="rectangular" width={80} height={24} sx={{ mt: 2, borderRadius: 1 }} />
      </CardContent>
    </Card>
  )
}

export default function TenantGrid({ sites, loading }: TenantGridProps) {
  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography variant="h3" component="h2" sx={{ mb: 1, color: 'text.primary' }}>
        Available Sites
      </Typography>
      <Typography variant="body1" sx={{ mb: 5, color: 'text.secondary', maxWidth: 600 }}>
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
