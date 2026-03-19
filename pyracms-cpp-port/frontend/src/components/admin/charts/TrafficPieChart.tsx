'use client'

import { useState, useEffect } from 'react'
import { Paper, Typography } from '@mui/material'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import api from '@/lib/api'

const DEFAULT_DATA = [
  { name: 'Articles', value: 0, color: '#1976d2' },
  { name: 'Forum', value: 0, color: '#2e7d32' },
  { name: 'Code Snippets', value: 0, color: '#ed6c02' },
  { name: 'Gallery', value: 0, color: '#9c27b0' },
]

const COLORS: Record<string, string> = {
  Articles: '#1976d2',
  Forum: '#2e7d32',
  'Code Snippets': '#ed6c02',
  Gallery: '#9c27b0',
  Other: '#757575',
}

export function TrafficPieChart({ tenantId }: { tenantId?: number | null }) {
  const [data, setData] = useState(DEFAULT_DATA)

  useEffect(() => {
    if (!tenantId) return
    // Try analytics endpoint, fall back to counting items
    api.get(`/api/analytics?tenant_id=${tenantId}`)
      .then(res => {
        if (res.data?.traffic) {
          setData(res.data.traffic.map((t: Record<string, unknown>) => ({
            name: t.name,
            value: t.value || t.count,
            color: COLORS[t.name as string] || '#757575',
          })))
        }
      })
      .catch(() => {
        // Fallback: count items per content type
        Promise.all([
          api.get(`/api/articles?tenant_id=${tenantId}`).then(r => (r.data || []).length).catch(() => 0),
          api.get(`/api/forum/categories?tenant_id=${tenantId}`).then(r => {
            const cats = r.data || []
            return cats.reduce((sum: number, c: Record<string, unknown>) => sum + ((c.forums as Array<Record<string, unknown>>) || []).reduce((s: number, f: Record<string, unknown>) => s + (Number(f.totalPosts) || 0), 0), 0)
          }).catch(() => 0),
          api.get(`/api/snippets?tenant_id=${tenantId}`).then(r => (r.data.items || r.data || []).length).catch(() => 0),
          api.get(`/api/gallery/albums?tenant_id=${tenantId}`).then(r => (r.data || []).reduce((s: number, a: Record<string, unknown>) => s + (Number(a.pictureCount) || 0), 0)).catch(() => 0),
        ]).then(([articles, posts, snippets, pictures]) => {
          setData([
            { name: 'Articles', value: articles, color: '#1976d2' },
            { name: 'Forum', value: posts, color: '#2e7d32' },
            { name: 'Code Snippets', value: snippets, color: '#ed6c02' },
            { name: 'Gallery', value: pictures, color: '#9c27b0' },
          ])
        })
      })
  }, [tenantId])

  return (
    <Paper variant="outlined" sx={{ p: 3, borderColor: 'divider' }}>
      <Typography variant="h6" gutterBottom>Traffic by Content Type</Typography>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Paper>
  )
}
