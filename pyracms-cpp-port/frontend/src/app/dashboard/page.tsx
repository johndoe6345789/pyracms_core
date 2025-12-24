'use client'

import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Card,
  CardContent,
} from '@mui/material'
import {
  DashboardOutlined,
  PeopleOutlined,
  ArticleOutlined,
  SettingsOutlined,
} from '@mui/icons-material'

export default function DashboardPage() {
  const stats = [
    {
      title: 'Total Users',
      value: '1,234',
      icon: PeopleOutlined,
      color: '#667eea',
    },
    {
      title: 'Content Items',
      value: '567',
      icon: ArticleOutlined,
      color: '#f093fb',
    },
    {
      title: 'Active Plugins',
      value: '8',
      icon: DashboardOutlined,
      color: '#4facfe',
    },
    {
      title: 'Settings',
      value: '12',
      icon: SettingsOutlined,
      color: '#43e97b',
    },
  ]

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: 6 }}>
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            sx={{ fontWeight: 700 }}
          >
            Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Welcome back! Here&apos;s an overview of your CMS.
          </Typography>
        </Box>

        {/* Stats Grid */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  height: '100%',
                  background: `linear-gradient(135deg, ${stat.color}15 0%, ${stat.color}05 100%)`,
                  border: `1px solid ${stat.color}30`,
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box
                      sx={{
                        bgcolor: stat.color,
                        borderRadius: 2,
                        p: 1,
                        display: 'flex',
                        mr: 2,
                      }}
                    >
                      <stat.icon sx={{ color: 'white', fontSize: 28 }} />
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {stat.value}
                    </Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontWeight: 600 }}
                  >
                    {stat.title}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Main Content */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 3,
                height: '100%',
              }}
            >
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
                Recent Activity
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Your latest content and updates
              </Typography>
              <Box
                sx={{
                  py: 8,
                  textAlign: 'center',
                  color: 'text.secondary',
                }}
              >
                <ArticleOutlined sx={{ fontSize: 64, opacity: 0.3, mb: 2 }} />
                <Typography variant="body1">
                  No recent activity to display
                </Typography>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 3,
                height: '100%',
              }}
            >
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
                Quick Actions
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Common tasks
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {[
                  'Create New Content',
                  'Manage Users',
                  'View Analytics',
                  'Plugin Settings',
                ].map((action, i) => (
                  <Box
                    key={i}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: 'background.default',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        bgcolor: 'primary.main',
                        color: 'white',
                        transform: 'translateX(4px)',
                      },
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {action}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}
