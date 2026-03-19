'use client'

import { Container, Typography, Box, Grid, Paper } from '@mui/material'
import { ArticleOutlined } from '@mui/icons-material'
import DashboardStats from '@/components/dashboard/DashboardStats'
import QuickActions from '@/components/dashboard/QuickActions'

export default function DashboardPage() {
  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        <Box sx={{ mb: 6 }}>
          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
            Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Welcome back! Here&apos;s an overview of your CMS.
          </Typography>
        </Box>

        <DashboardStats />

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
                Recent Activity
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Your latest content and updates
              </Typography>
              <Box sx={{ py: 8, textAlign: 'center', color: 'text.secondary' }}>
                <ArticleOutlined sx={{ fontSize: 64, opacity: 0.3, mb: 2 }} />
                <Typography variant="body1">No recent activity to display</Typography>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <QuickActions />
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}
