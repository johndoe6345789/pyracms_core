'use client'

import { useState } from 'react'
import {
  Box,
  Paper,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { DateRange, DATA_MAP } from './pageViewData'

const headSx = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  mb: 2,
}

export function PageViewChart() {
  const [range, setRange] = useState<DateRange>('daily')

  return (
    <Paper variant="outlined" sx={{ p: 3, borderColor: 'divider' }}>
      <Box sx={headSx}>
        <Typography variant="h6">Page Views</Typography>
        <ToggleButtonGroup
          value={range}
          exclusive
          onChange={(_, v) => v && setRange(v)}
          size="small"
        >
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
          <Line
            type="monotone"
            dataKey="views"
            stroke="#1976d2"
            strokeWidth={2}
            name="Total Views"
          />
          <Line
            type="monotone"
            dataKey="unique"
            stroke="#2e7d32"
            strokeWidth={2}
            name="Unique Visitors"
          />
        </LineChart>
      </ResponsiveContainer>
    </Paper>
  )
}
