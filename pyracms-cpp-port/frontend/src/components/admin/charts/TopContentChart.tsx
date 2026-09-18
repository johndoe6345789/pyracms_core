'use client'

import { useState, useEffect } from 'react'
import { Paper, Typography } from '@mui/material'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { ContentItem, fetchTopContent } from './topContentFetcher'

export function TopContentChart({
  tenantId,
}: {
  tenantId?: number | null
}) {
  const [data, setData] = useState<ContentItem[]>([])

  useEffect(() => {
    if (!tenantId) return
    fetchTopContent(tenantId)
      .then((items) => items && setData(items))
      .catch(() => {})
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
