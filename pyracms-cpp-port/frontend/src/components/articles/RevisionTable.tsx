'use client'

import { Table, TableBody, TableContainer, Paper } from '@mui/material'
import type { Revision } from '@/hooks/useRevisions'
import { ErrorAlert } from '../common/ErrorAlert'
import { RevisionViewDialog } from './RevisionViewDialog'
import { RevertConfirmDialog } from './RevertConfirmDialog'
import { RevisionRow } from './RevisionRow'
import { RevisionTableHead } from './RevisionTableHead'
import { useRevisionDialogs } from './useRevisionDialogs'

interface RevisionTableProps {
  revisions: Revision[]
  latestRevision: number
  articleName?: string
  renderer?: string
  tenantId?: number | null
  onRevert?: (n: number) => Promise<void>
}

export function RevisionTable({
  revisions,
  latestRevision,
  articleName,
  renderer = 'markdown',
  tenantId,
  onRevert,
}: RevisionTableProps) {
  const d = useRevisionDialogs(articleName, tenantId, onRevert)

  return (
    <>
      <ErrorAlert error={d.error} testId="revision-error" />
      <TableContainer component={Paper} variant="outlined">
        <Table data-testid="revision-table">
          <RevisionTableHead />
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
        content={d.content}
        renderer={renderer}
      />
      <RevertConfirmDialog
        revisionNumber={d.revertNum}
        onClose={() => d.setRevertNum(null)}
        onConfirm={d.handleRevert}
      />
    </>
  )
}
