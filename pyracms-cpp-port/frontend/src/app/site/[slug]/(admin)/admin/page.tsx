'use client'

import { useParams } from 'next/navigation'
import { Typography, Box, Grid } from '@mui/material'
import { useTenantId } from '@/hooks/useTenantId'
import DashboardStats from
  '@/components/dashboard/DashboardStats'
import QuickLinkCard from
  '@/components/admin/QuickLinkCard'
import { buildQuickLinks } from
  '@/components/admin/dashboard/quickLinks'

export default function TenantAdminDashboardPage() {
  const params = useParams()
  const slug = params.slug as string
  const { tenantId } = useTenantId(slug)

  return (
    <Box data-testid="admin-dashboard">
      <Typography variant="h3" sx={{ mb: 1 }}>
        Dashboard
      </Typography>
      <Typography
        variant="body1"
        color="text.secondary"
        sx={{ mb: 4 }}
      >
        Overview of your {slug} site.
      </Typography>
      <DashboardStats tenantId={tenantId} />
      <Typography variant="h4" sx={{ mb: 3 }}>
        Quick Links
      </Typography>
      <Grid
        container
        spacing={3}
        data-testid="quick-links-grid"
      >
        {buildQuickLinks(slug).map((link) => (
          <Grid item xs={12} sm={6} md={4} key={link.label}>
            <QuickLinkCard {...link} />
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}
