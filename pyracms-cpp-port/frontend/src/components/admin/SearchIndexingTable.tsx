import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import type { SearchStatus } from '@/hooks/admin/useSearchIndexing'

const LABELS: Record<string, string> = {
  article: 'Articles',
  snippet: 'Code snippets',
  forum_post: 'Forum posts',
  gamedep: 'Games & dependencies',
}

/** Documents that should be searchable vs the ones the index holds. */
export function SearchIndexingTable({ status }: { status: SearchStatus }) {
  const types = Object.keys({ ...status.source, ...status.indexed }).sort()
  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small" aria-label="Indexed content by type">
        <TableHead>
          <TableRow>
            <TableCell>Content</TableCell>
            <TableCell align="right">Searchable</TableCell>
            <TableCell align="right">In the index</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {types.map((t) => (
            <TableRow key={t} data-testid={`index-row-${t}`}>
              <TableCell>{LABELS[t] ?? t}</TableCell>
              <TableCell align="right">{status.source[t] ?? 0}</TableCell>
              <TableCell align="right">
                {status.configured ? (status.indexed[t] ?? 0) : '-'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
