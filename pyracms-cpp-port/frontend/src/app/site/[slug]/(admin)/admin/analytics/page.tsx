'use client'

import { Container, Typography, Grid } from '@mui/material'
import { PageViewChart } from '@/components/admin/charts/PageViewChart'
import { TopContentChart } from '@/components/admin/charts/TopContentChart'
import { TrafficPieChart } from '@/components/admin/charts/TrafficPieChart'
import {
  ReferrersTable,
  SearchesTable,
} from '@/components/admin/analytics/AnalyticsTables'
import SummaryCards from '@/components/admin/analytics/SummaryCards'
import { useTenantId } from '@/hooks/useTenantId'
import { useParams } from 'next/navigation'

export default function AnalyticsPage() {
  const params = useParams()
  const slug = params.slug as string
  const { tenantId } = useTenantId(slug)
  return (
    <Container maxWidth="xl" sx={{ py: { xs: 3, md: 6 } }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Analytics Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Overview of site traffic and content performance.
      </Typography>
      <SummaryCards tenantId={tenantId} />
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <PageViewChart tenantId={tenantId} />
        </Grid>
        <Grid item xs={12} md={6}>
          <TopContentChart tenantId={tenantId} />
        </Grid>
        <Grid item xs={12} md={6}>
          <TrafficPieChart tenantId={tenantId} />
        </Grid>
        <Grid item xs={12} md={6}>
          <ReferrersTable tenantId={tenantId} />
        </Grid>
        <Grid item xs={12} md={6}>
          <SearchesTable tenantId={tenantId} />
        </Grid>
      </Grid>
    </Container>
  )
}
