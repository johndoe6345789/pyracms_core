'use client'

import { useState, useEffect } from 'react'
import { Grid, Card, CardContent, Typography, Box } from '@mui/material'
import {
  PeopleOutlined, ArticleOutlined, DashboardOutlined, SettingsOutlined,
} from '@mui/icons-material'
import type { SvgIconComponent } from '@mui/icons-material'
import api from '@/lib/api'

interface Stat {
  title: string
  value: string
  icon: SvgIconComponent
  color: string
}

export default function DashboardStats() {
  const [stats, setStats] = useState<Stat[]>([
    { title: 'Total Users', value: '...', icon: PeopleOutlined, color: '#667eea' },
    { title: 'Content Items', value: '...', icon: ArticleOutlined, color: '#f093fb' },
    { title: 'Tenants', value: '...', icon: DashboardOutlined, color: '#4facfe' },
    { title: 'Settings', value: '...', icon: SettingsOutlined, color: '#43e97b' },
  ])

  useEffect(() => {
    Promise.all([
      api.get('/api/users').then(r => (r.data || []).length).catch(() => 0),
      api.get('/api/tenants').then(r => {
        const tenants = r.data || []
        const tenantCount = tenants.length
        const tenantId = tenants[0]?.id
        return { tenantCount, tenantId }
      }).catch(() => ({ tenantCount: 0, tenantId: null })),
    ]).then(async ([userCount, { tenantCount, tenantId }]) => {
      let articleCount = 0
      let settingCount = 0
      if (tenantId) {
        articleCount = await api.get(`/api/articles?tenant_id=${tenantId}`).then(r => (r.data || []).length).catch(() => 0)
        settingCount = await api.get(`/api/settings?tenant_id=${tenantId}`).then(r => (r.data || []).length).catch(() => 0)
      }
      setStats([
        { title: 'Total Users', value: String(userCount), icon: PeopleOutlined, color: '#667eea' },
        { title: 'Content Items', value: String(articleCount), icon: ArticleOutlined, color: '#f093fb' },
        { title: 'Tenants', value: String(tenantCount), icon: DashboardOutlined, color: '#4facfe' },
        { title: 'Settings', value: String(settingCount), icon: SettingsOutlined, color: '#43e97b' },
      ])
    })
  }, [])

  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {stats.map((stat, index) => (
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
