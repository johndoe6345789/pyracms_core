'use client'

import { Grid, Card, CardContent, Typography, Box } from '@mui/material'
import {
  PeopleOutlined, ArticleOutlined, DashboardOutlined, SettingsOutlined,
} from '@mui/icons-material'
import type { SvgIconComponent } from '@mui/icons-material'

interface Stat {
  title: string
  value: string
  icon: SvgIconComponent
  color: string
}

const STATS: Stat[] = [
  { title: 'Total Users', value: '1,234', icon: PeopleOutlined, color: '#667eea' },
  { title: 'Content Items', value: '567', icon: ArticleOutlined, color: '#f093fb' },
  { title: 'Active Plugins', value: '8', icon: DashboardOutlined, color: '#4facfe' },
  { title: 'Settings', value: '12', icon: SettingsOutlined, color: '#43e97b' },
]

export default function DashboardStats() {
  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {STATS.map((stat, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <Card sx={{
            height: '100%',
            background: `linear-gradient(135deg, ${stat.color}15 0%, ${stat.color}05 100%)`,
            border: `1px solid ${stat.color}30`,
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 },
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ bgcolor: stat.color, borderRadius: 2, p: 1, display: 'flex', mr: 2 }}>
                  <stat.icon sx={{ color: 'white', fontSize: 28 }} />
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>{stat.value}</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                {stat.title}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  )
}
