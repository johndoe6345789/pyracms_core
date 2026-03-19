'use client'

import { useState } from 'react'
import {
  Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow,
  Paper, Box, Button,
} from '@mui/material'
import {
  VisibilityOutlined, RestoreOutlined,
} from '@mui/icons-material'
import DOMPurify from 'dompurify'
import type { Revision } from '@/hooks/useRevisions'
import api from '@/lib/api'
import {
  RevisionViewDialog,
} from './RevisionViewDialog'
import {
  RevertConfirmDialog,
} from './RevertConfirmDialog'

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
    api.get(`/api/articles/${articleName}`
      + `/revisions/${rev.number}`
      + `?tenant_id=${tenantId}`)
      .then((res) => {
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

  return (
    <>
      <TableContainer
        component={Paper} variant="outlined">
        <Table data-testid="revision-table">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>
                Rev #</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>
                Author</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>
                Date</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>
                Summary</TableCell>
              <TableCell
                sx={{ fontWeight: 600 }}
                align="right">
                Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {revisions.map((rev) => (
              <TableRow key={rev.number} hover>
                <TableCell>{rev.number}</TableCell>
                <TableCell>{rev.author}</TableCell>
                <TableCell>{rev.date}</TableCell>
                <TableCell>{rev.summary}</TableCell>
                <TableCell align="right">
                  <Box sx={{
                    display: 'flex', gap: 1,
                    justifyContent: 'flex-end',
                  }}>
                    <Button size="small"
                      variant="outlined"
                      startIcon={
                        <VisibilityOutlined />}
                      onClick={() =>
                        handleView(rev)}
                      data-testid={
                        `view-rev-${rev.number}`}>
                      View</Button>
                    {rev.number
                      !== latestRevision && (
                      <Button size="small"
                        variant="outlined"
                        color="warning"
                        startIcon={
                          <RestoreOutlined />}
                        onClick={() =>
                          setRevertNum(rev.number)}
                        data-testid={
                          `revert-${rev.number}`}>
                        Revert</Button>)}
                  </Box>
                </TableCell>
              </TableRow>))}
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
