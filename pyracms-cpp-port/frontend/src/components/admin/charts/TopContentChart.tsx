'use client'

import { useState, useEffect } from 'react'
import { Paper, Typography } from '@mui/material'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import api from '@/lib/api'

interface ContentItem {
  name: string
  views: number
}

export function TopContentChart({ tenantId }: { tenantId?: number | null }) {
  const [data, setData] = useState<ContentItem[]>([])

  useEffect(() => {
    if (!tenantId) return
    // Try analytics endpoint first, fall back to article view counts
    api.get(`/api/analytics/top-content?tenant_id=${tenantId}`)
      .then(res => {
        if (Array.isArray(res.data)) {
          setData(res.data.map((item: Record<string, unknown>) => ({
            name: String(item.title || item.name || ''),
            views: Number(item.views || item.viewCount || 0),
          })))
        }
      })
      .catch(() => {
        api.get(`/api/articles?tenant_id=${tenantId}`)
          .then(res => {
            const articles = (res.data || [])
              .map((a: Record<string, unknown>) => ({
                name: (a.displayName as string || '').substring(0, 25),
                views: Number(a.viewCount) || 0,
              }))
              .sort((a: ContentItem, b: ContentItem) => b.views - a.views)
              .slice(0, 8)
            setData(articles)
          })
          .catch(() => {})
      })
  }, [tenantId])

  return (
    <Paper variant="outlined" sx={{ p: 3, borderColor: 'divider' }}>
      <Typography variant="h6" gutterBottom>Top Content</Typography>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical" margin={{ left: 80 }}>
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
