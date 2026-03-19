'use client'

import { Paper, Typography } from '@mui/material'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const PLACEHOLDER_DATA = [
  { name: 'Getting Started', views: 1240 },
  { name: 'API Reference', views: 980 },
  { name: 'Tutorials', views: 850 },
  { name: 'Configuration', views: 720 },
  { name: 'Deployment', views: 650 },
  { name: 'FAQ', views: 580 },
  { name: 'Changelog', views: 430 },
  { name: 'Contributing', views: 380 },
]

export function TopContentChart() {
  return (
    <Paper variant="outlined" sx={{ p: 3, borderColor: 'divider' }}>
      <Typography variant="h6" gutterBottom>Top Content</Typography>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={PLACEHOLDER_DATA} layout="vertical" margin={{ left: 80 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis type="category" dataKey="name" width={80} />
          <Tooltip />
          <Bar dataKey="views" fill="#1976d2" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  )
}
