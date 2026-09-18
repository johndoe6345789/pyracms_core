'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material'
import type { Revision } from '@/hooks/useRevisions'
import { RevisionViewDialog } from './RevisionViewDialog'
import { RevertConfirmDialog } from './RevertConfirmDialog'
import { RevisionRow } from './RevisionRow'
import { useRevisionDialogs } from './useRevisionDialogs'

interface RevisionTableProps {
  revisions: Revision[]
  latestRevision: number
  articleName?: string
  tenantId?: number | null
  onRevert?: (n: number) => Promise<void>
}

const hdr = { fontWeight: 600 }

export function RevisionTable({
  revisions,
  latestRevision,
  articleName,
  tenantId,
  onRevert,
}: RevisionTableProps) {
  const d = useRevisionDialogs(articleName, tenantId, onRevert)

  return (
    <>
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
            {revisions.map((rev) => (
              <RevisionRow
                key={rev.number}
                rev={rev}
                isLatest={rev.number === latestRevision}
                onView={d.handleView}
                onRevert={d.setRevertNum}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <RevisionViewDialog
        open={d.dlgOpen}
        onClose={() => d.setDlgOpen(false)}
        revision={d.viewRev}
        sanitizedContent={d.content}
      />
      <RevertConfirmDialog
        revisionNumber={d.revertNum}
        onClose={() => d.setRevertNum(null)}
        onConfirm={d.handleRevert}
      />
    </>
  )
}
