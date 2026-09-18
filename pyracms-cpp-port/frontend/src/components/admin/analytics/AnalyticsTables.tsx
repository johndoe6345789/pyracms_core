import {
  Typography, Paper, Box, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow,
} from '@mui/material'
import { TOP_REFERRERS, POPULAR_SEARCHES } from './analyticsData'

function Panel({
  title,
  heads,
  children,
}: {
  title: string
  heads: { label: string; right?: boolean }[]
  children: React.ReactNode
}) {
  return (
    <Paper variant="outlined" sx={{ borderColor: 'divider' }}>
      <Box sx={{ px: 3, py: 2 }}>
        <Typography variant="h6">{title}</Typography>
      </Box>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              {heads.map((h) => (
                <TableCell
                  key={h.label}
                  align={h.right ? 'right' : 'left'}
                >
                  {h.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>{children}</TableBody>
        </Table>
      </TableContainer>
    </Paper>
  )
}

export function ReferrersTable() {
  return (
    <Panel
      title="Top Referrers"
      heads={[
        { label: 'Source' },
        { label: 'Visits', right: true },
        { label: '%', right: true },
      ]}
    >
      {TOP_REFERRERS.map((row) => (
        <TableRow key={row.source}>
          <TableCell>{row.source}</TableCell>
          <TableCell align="right">
            {row.visits.toLocaleString()}
          </TableCell>
          <TableCell align="right">{row.percentage}%</TableCell>
        </TableRow>
      ))}
    </Panel>
  )
}

export function SearchesTable() {
  return (
    <Panel
      title="Popular Search Queries"
      heads={[
        { label: 'Query' },
        { label: 'Searches', right: true },
      ]}
    >
      {POPULAR_SEARCHES.map((row) => (
        <TableRow key={row.query}>
          <TableCell>{row.query}</TableCell>
          <TableCell align="right">{row.count}</TableCell>
        </TableRow>
      ))}
    </Panel>
  )
}
