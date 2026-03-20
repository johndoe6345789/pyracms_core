'use client'

import { useState, useEffect } from 'react'
import { Paper, Typography } from '@mui/material'
import {
  PieChart, Pie, Cell, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts'
import api from '@/lib/api'
import {
  TrafficEntry, DEFAULT_DATA,
  mapTraffic, fetchFallback,
} from './trafficFetcher'

export function TrafficPieChart({ tenantId }: {
  tenantId?: number | null
}) {
  const [data, setData] =
    useState<TrafficEntry[]>(DEFAULT_DATA)

  useEffect(() => {
    if (!tenantId) return
    const url =
      `/api/analytics?tenant_id=${tenantId}`
    api.get(url)
      .then((res) => {
        if (res.data?.traffic) {
          setData(
            mapTraffic(res.data.traffic),
          )
        }
      })
      .catch(() => {
        fetchFallback(tenantId)
          .then(setData)
      })
  }, [tenantId])

  const renderLabel = ({
    name, percent,
  }: {
    name: string
    percent: number
  }) => {
    const pct = (percent * 100).toFixed(0)
    return `${name} ${pct}%`
  }

  return (
    <Paper
      variant="outlined"
      sx={{ p: 3, borderColor: 'divider' }}
      data-testid="traffic-pie-chart"
    >
      <Typography variant="h6" gutterBottom>
        Traffic by Content Type
      </Typography>
      <ResponsiveContainer
        width="100%" height={300}
      >
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
            label={renderLabel}
          >
            {data.map((entry) => (
              <Cell
                key={entry.name}
                fill={entry.color}
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Paper>
  )
}
