'use client'

import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import type { Revision } from '@/hooks/useRevisions'
import { RevisionRow } from '@/components/articles/RevisionRow'

interface Props {
  revisions: Revision[]
  latest: number
  canRevert: boolean
  onView: (rev: Revision) => void
  onRevert: (num: number) => void
}

const hdr = { fontWeight: 600 }

export function SnippetRevisionTable(p: Props) {
  return (
    <TableContainer component={Paper} variant="outlined">
      <Table data-testid="revision-table">
        <TableHead>
          <TableRow>
            <TableCell sx={hdr}>Rev #</TableCell>
            <TableCell sx={hdr}>Author</TableCell>
            <TableCell sx={hdr}>Date</TableCell>
            <TableCell sx={hdr}>Summary</TableCell>
            <TableCell sx={hdr} align="right">
              Actions
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {p.revisions.map((rev) => (
            <RevisionRow
              key={rev.number}
              rev={rev}
              isLatest={rev.number === p.latest}
              canRevert={p.canRevert}
              onView={p.onView}
              onRevert={p.onRevert}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
