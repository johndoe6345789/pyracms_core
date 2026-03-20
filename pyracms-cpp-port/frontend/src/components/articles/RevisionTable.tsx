'use client'

import { useState } from 'react'
import {
  Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow,
  Paper,
} from '@mui/material'
import DOMPurify from 'dompurify'
import type { Revision } from '@/hooks/useRevisions'
import api from '@/lib/api'
import {
  RevisionViewDialog,
} from './RevisionViewDialog'
import {
  RevertConfirmDialog,
} from './RevertConfirmDialog'
import { RevisionRow } from './RevisionRow'

interface RevisionTableProps {
  revisions: Revision[]
  latestRevision: number
  articleName?: string
  tenantId?: number | null
  onRevert?: (n: number) => Promise<void>
}

export function RevisionTable({
  revisions, latestRevision,
  articleName, tenantId, onRevert,
}: RevisionTableProps) {
  const [dlgOpen, setDlgOpen] = useState(false)
  const [content, setContent] = useState('')
  const [viewRev, setViewRev] =
    useState<Revision | null>(null)
  const [revertNum, setRevertNum] =
    useState<number | null>(null)

  const handleView = (rev: Revision) => {
    if (!articleName || !tenantId) return
    const url = `/api/articles/${articleName}`
      + `/revisions/${rev.number}`
      + `?tenant_id=${tenantId}`
    api.get(url).then((res) => {
      setContent(DOMPurify.sanitize(
        res.data.content || ''))
      setViewRev(rev)
      setDlgOpen(true)
    }).catch(() => {})
  }

  const handleRevert = () => {
    if (revertNum === null || !onRevert) return
    onRevert(revertNum)
      .then(() => setRevertNum(null))
      .catch(() => {})
  }

  const hdr = { fontWeight: 600 }
  return (
    <>
      <TableContainer
        component={Paper} variant="outlined">
        <Table data-testid="revision-table">
          <TableHead>
            <TableRow>
              <TableCell sx={hdr}>Rev #</TableCell>
              <TableCell sx={hdr}>Author</TableCell>
              <TableCell sx={hdr}>Date</TableCell>
              <TableCell sx={hdr}>Summary</TableCell>
              <TableCell sx={hdr} align="right">
                Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {revisions.map((rev) => (
              <RevisionRow key={rev.number}
                rev={rev}
                isLatest={
                  rev.number === latestRevision}
                onView={handleView}
                onRevert={setRevertNum} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <RevisionViewDialog
        open={dlgOpen}
        onClose={() => setDlgOpen(false)}
        revision={viewRev}
        sanitizedContent={content} />
      <RevertConfirmDialog
        revisionNumber={revertNum}
        onClose={() => setRevertNum(null)}
        onConfirm={handleRevert} />
    </>
  )
}
