'use client'

import {
  Container, Typography, Grid, Paper, Box,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material'
import { PageViewChart } from '@/components/admin/charts/PageViewChart'
import { TopContentChart } from '@/components/admin/charts/TopContentChart'
import { TrafficPieChart } from '@/components/admin/charts/TrafficPieChart'

const TOP_REFERRERS = [
  { source: 'Google Search', visits: 3420, percentage: 35.2 },
  { source: 'Direct', visits: 2180, percentage: 22.4 },
  { source: 'GitHub', visits: 1560, percentage: 16.0 },
  { source: 'Twitter/X', visits: 890, percentage: 9.2 },
  { source: 'Reddit', visits: 670, percentage: 6.9 },
  { source: 'Hacker News', visits: 520, percentage: 5.3 },
  { source: 'Stack Overflow', visits: 340, percentage: 3.5 },
  { source: 'Other', visits: 150, percentage: 1.5 },
]

const POPULAR_SEARCHES = [
  { query: 'next.js tutorial', count: 245 },
  { query: 'react hooks', count: 189 },
  { query: 'typescript generics', count: 156 },
  { query: 'api authentication', count: 134 },
  { query: 'docker deployment', count: 112 },
  { query: 'css grid layout', count: 98 },
  { query: 'websocket example', count: 87 },
  { query: 'database migration', count: 76 },
]

export default function AnalyticsPage() {
  return (
    <Container maxWidth="xl" sx={{ py: 6 }}>
      <Typography variant="h3" component="h1" gutterBottom>Analytics Dashboard</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Overview of site traffic and content performance.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <PageViewChart />
        </Grid>

        <Grid item xs={12} md={6}>
          <TopContentChart />
        </Grid>
        <Grid item xs={12} md={6}>
          <TrafficPieChart />
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ borderColor: 'divider' }}>
            <Box sx={{ px: 3, py: 2 }}>
              <Typography variant="h6">Top Referrers</Typography>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Source</TableCell>
                    <TableCell align="right">Visits</TableCell>
                    <TableCell align="right">%</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {TOP_REFERRERS.map((row) => (
                    <TableRow key={row.source}>
                      <TableCell>{row.source}</TableCell>
                      <TableCell align="right">{row.visits.toLocaleString()}</TableCell>
                      <TableCell align="right">{row.percentage}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ borderColor: 'divider' }}>
            <Box sx={{ px: 3, py: 2 }}>
              <Typography variant="h6">Popular Search Queries</Typography>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Query</TableCell>
                    <TableCell align="right">Searches</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {POPULAR_SEARCHES.map((row) => (
                    <TableRow key={row.query}>
                      <TableCell>{row.query}</TableCell>
                      <TableCell align="right">{row.count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  )
}
