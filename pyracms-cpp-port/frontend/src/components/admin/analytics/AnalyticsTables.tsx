import { TableCell, TableRow } from '@mui/material'
import Panel from './AnalyticsPanel'
import { TOP_REFERRERS, POPULAR_SEARCHES } from './analyticsData'

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
