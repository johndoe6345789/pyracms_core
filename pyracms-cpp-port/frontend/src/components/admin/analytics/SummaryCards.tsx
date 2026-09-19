'use client'

import { useEffect, useState } from 'react'
import { Grid, Paper, Typography } from '@mui/material'
import api from '@/lib/api'

/** "totalViews" -> "Total views". */
export function humanize(key: string): string {
  const s = key
    .replace(/([A-Z])/g, ' $1')
    .toLowerCase()
    .trim()
  return s.charAt(0).toUpperCase() + s.slice(1)
}

/** Numeric fields of GET /api/analytics/summary as stat tiles. */
export default function SummaryCards({
  tenantId,
}: {
  tenantId: number | null
}) {
  const [stats, setStats] = useState<[string, number][]>([])
  useEffect(() => {
    if (!tenantId) return
    api
      .get(`/api/analytics/summary?tenant_id=${tenantId}`)
      .then((r) =>
        setStats(
          Object.entries(r.data ?? {}).filter(
            (e): e is [string, number] => typeof e[1] === 'number',
          ),
        ),
      )
      .catch(() => {})
  }, [tenantId])
  if (stats.length === 0) return null
  return (
    <Grid container spacing={2} sx={{ mb: 3 }} data-testid="analytics-summary">
      {stats.map(([k, v]) => (
        <Grid item xs={6} md={3} key={k}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="h4">{v.toLocaleString()}</Typography>
            <Typography variant="body2" color="text.secondary">
              {humanize(k)}
            </Typography>
          </Paper>
        </Grid>
      ))}
    </Grid>
  )
}
