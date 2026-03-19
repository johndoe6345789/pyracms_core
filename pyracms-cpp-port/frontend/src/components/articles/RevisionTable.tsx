'use client'

import { useState } from 'react'
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  Typography,
} from '@mui/material'
import { VisibilityOutlined, RestoreOutlined } from '@mui/icons-material'
import DOMPurify from 'dompurify'
import type { Revision } from '@/hooks/useRevisions'
import api from '@/lib/api'

interface RevisionTableProps {
  revisions: Revision[]
  latestRevision: number
  articleName?: string
  tenantId?: number | null
  onRevert?: (revNumber: number) => Promise<void>
}

export function RevisionTable({ revisions, latestRevision, articleName, tenantId, onRevert }: RevisionTableProps) {
  const [viewDialog, setViewDialog] = useState(false)
  const [viewContent, setViewContent] = useState('')
  const [viewRev, setViewRev] = useState<Revision | null>(null)
  const [confirmRevert, setConfirmRevert] = useState<number | null>(null)

  const handleView = (rev: Revision) => {
    if (articleName && tenantId) {
      api.get(`/api/articles/${articleName}/revisions/${rev.number}?tenant_id=${tenantId}`)
        .then(res => {
          setViewContent(DOMPurify.sanitize(res.data.content || ''))
          setViewRev(rev)
          setViewDialog(true)
        })
        .catch(() => {})
    }
  }

  const handleRevert = () => {
    if (confirmRevert !== null && onRevert) {
      onRevert(confirmRevert).then(() => setConfirmRevert(null)).catch(() => {})
    }
  }

  return (
    <>
      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Rev #</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Author</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Summary</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
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
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                    <Button size="small" variant="outlined" startIcon={<VisibilityOutlined />} onClick={() => handleView(rev)}>View</Button>
                    {rev.number !== latestRevision && (
                      <Button size="small" variant="outlined" color="warning" startIcon={<RestoreOutlined />} onClick={() => setConfirmRevert(rev.number)}>Revert</Button>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={viewDialog} onClose={() => setViewDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Revision {viewRev?.number} — {viewRev?.author}</DialogTitle>
        <DialogContent>
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>{viewRev?.date}</Typography>
          <Paper variant="outlined" sx={{ p: 2, maxHeight: 400, overflow: 'auto' }}>
            <div dangerouslySetInnerHTML={{ __html: viewContent }} />
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmRevert !== null} onClose={() => setConfirmRevert(null)}>
        <DialogTitle>Revert to revision {confirmRevert}?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setConfirmRevert(null)}>Cancel</Button>
          <Button color="warning" onClick={handleRevert}>Revert</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
