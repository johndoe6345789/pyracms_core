'use client'

import { TableCell, TableRow } from '@mui/material'
import Panel from './AnalyticsPanel'
import { useAnalyticsRows } from '@/hooks/useAnalyticsRows'
import { mapReferrers, mapSearches } from '@/lib/analyticsRows'

type Site = { tenantId?: number | null }

/** One full-width line saying why a table has no rows. */
function Note({ cols, text }: { cols: number; text: string }) {
  return (
    <TableRow>
      <TableCell colSpan={cols} sx={{ color: 'text.secondary' }}>
        {text}
      </TableCell>
    </TableRow>
  )
}

/** Where visitors came from, from the recorded referrers. */
export function ReferrersTable({ tenantId }: Site) {
  const { rows, failed } = useAnalyticsRows(
    'traffic-sources',
    tenantId,
    mapReferrers,
  )
  return (
    <Panel
      title="Top Referrers"
      heads={[
        { label: 'Source' },
        { label: 'Visits', right: true },
        { label: '%', right: true },
      ]}
    >
      {rows.length === 0 && (
        <Note
          cols={3}
          text={failed ? 'Could not be loaded.' : 'No visits recorded yet.'}
        />
      )}
      {rows.map((row) => (
        <TableRow key={row.source}>
          <TableCell>{row.source}</TableCell>
          <TableCell align="right">{row.visits.toLocaleString()}</TableCell>
          <TableCell align="right">{row.percentage}%</TableCell>
        </TableRow>
      ))}
    </Panel>
  )
}

/** What visitors searched for on the site. */
export function SearchesTable({ tenantId }: Site) {
  const { rows, failed } = useAnalyticsRows(
    'search-queries',
    tenantId,
    mapSearches,
  )
  return (
    <Panel
      title="Popular Search Queries"
      heads={[{ label: 'Query' }, { label: 'Searches', right: true }]}
    >
      {rows.length === 0 && (
        <Note
          cols={2}
          text={failed ? 'Could not be loaded.' : 'No searches recorded yet.'}
        />
      )}
      {rows.map((row) => (
        <TableRow key={row.query}>
          <TableCell>{row.query}</TableCell>
          <TableCell align="right">{row.count.toLocaleString()}</TableCell>
        </TableRow>
      ))}
    </Panel>
  )
}
