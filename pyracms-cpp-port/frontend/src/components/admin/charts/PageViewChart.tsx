'use client'

import { useState } from 'react'
import { Box, Paper, Typography, ToggleButton, ToggleButtonGroup } from '@mui/material'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

type DateRange = 'daily' | 'weekly' | 'monthly'

const DAILY_DATA = [
  { date: 'Mar 1', views: 320, unique: 210 },
  { date: 'Mar 2', views: 450, unique: 290 },
  { date: 'Mar 3', views: 380, unique: 240 },
  { date: 'Mar 4', views: 520, unique: 340 },
  { date: 'Mar 5', views: 610, unique: 390 },
  { date: 'Mar 6', views: 480, unique: 310 },
  { date: 'Mar 7', views: 350, unique: 220 },
  { date: 'Mar 8', views: 410, unique: 270 },
  { date: 'Mar 9', views: 530, unique: 350 },
  { date: 'Mar 10', views: 590, unique: 380 },
  { date: 'Mar 11', views: 640, unique: 420 },
  { date: 'Mar 12', views: 700, unique: 460 },
  { date: 'Mar 13', views: 550, unique: 360 },
  { date: 'Mar 14', views: 480, unique: 310 },
]

const WEEKLY_DATA = [
  { date: 'Week 1', views: 2100, unique: 1400 },
  { date: 'Week 2', views: 2800, unique: 1850 },
  { date: 'Week 3', views: 3200, unique: 2100 },
  { date: 'Week 4', views: 2900, unique: 1900 },
]

const MONTHLY_DATA = [
  { date: 'Oct', views: 8500, unique: 5600 },
  { date: 'Nov', views: 9200, unique: 6100 },
  { date: 'Dec', views: 7800, unique: 5100 },
  { date: 'Jan', views: 10500, unique: 6900 },
  { date: 'Feb', views: 11200, unique: 7400 },
  { date: 'Mar', views: 12800, unique: 8400 },
]

const DATA_MAP: Record<DateRange, typeof DAILY_DATA> = {
  daily: DAILY_DATA,
  weekly: WEEKLY_DATA,
  monthly: MONTHLY_DATA,
}

export function PageViewChart() {
  const [range, setRange] = useState<DateRange>('daily')

  return (
    <Paper variant="outlined" sx={{ p: 3, borderColor: 'divider' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Page Views</Typography>
        <ToggleButtonGroup value={range} exclusive onChange={(_, v) => v && setRange(v)} size="small">
          <ToggleButton value="daily">Daily</ToggleButton>
          <ToggleButton value="weekly">Weekly</ToggleButton>
          <ToggleButton value="monthly">Monthly</ToggleButton>
        </ToggleButtonGroup>
      </Box>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={DATA_MAP[range]}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="views" stroke="#1976d2" strokeWidth={2} name="Total Views" />
          <Line type="monotone" dataKey="unique" stroke="#2e7d32" strokeWidth={2} name="Unique Visitors" />
        </LineChart>
      </ResponsiveContainer>
    </Paper>
  )
}
