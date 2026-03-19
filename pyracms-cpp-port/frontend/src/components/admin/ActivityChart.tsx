'use client'

import { Paper, Typography } from '@mui/material'
import {
  LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'

const ACTIVITY_DATA = [
  { day: 'Mon', actions: 42 },
  { day: 'Tue', actions: 56 },
  { day: 'Wed', actions: 38 },
  { day: 'Thu', actions: 71 },
  { day: 'Fri', actions: 63 },
  { day: 'Sat', actions: 29 },
  { day: 'Sun', actions: 35 },
]

export default function ActivityChart() {
  return (
    <Paper
      variant="outlined"
      sx={{ p: 3, borderColor: 'divider' }}
    >
      <Typography variant="h6" gutterBottom>
        Activity This Week
      </Typography>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={ACTIVITY_DATA}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="actions"
            stroke="#1976d2"
            strokeWidth={2}
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Paper>
  )
}
