'use client'

import { Paper, Typography } from '@mui/material'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const PLACEHOLDER_DATA = [
  { name: 'Articles', value: 4500, color: '#1976d2' },
  { name: 'Forum', value: 3200, color: '#2e7d32' },
  { name: 'Code Snippets', value: 1800, color: '#ed6c02' },
  { name: 'Gallery', value: 900, color: '#9c27b0' },
  { name: 'Other', value: 600, color: '#757575' },
]

export function TrafficPieChart() {
  return (
    <Paper variant="outlined" sx={{ p: 3, borderColor: 'divider' }}>
      <Typography variant="h6" gutterBottom>Traffic by Content Type</Typography>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={PLACEHOLDER_DATA}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {PLACEHOLDER_DATA.map((entry) => (
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
