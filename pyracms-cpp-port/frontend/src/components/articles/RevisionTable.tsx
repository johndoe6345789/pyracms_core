'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Button,
} from '@mui/material'
import {
  VisibilityOutlined,
  RestoreOutlined,
} from '@mui/icons-material'
import DOMPurify from 'dompurify'
import type { Revision } from '@/hooks/useRevisions'
import api from '@/lib/api'
import {
  RevisionViewDialog,
  RevertConfirmDialog,
} from './RevisionDialogs'

interface RevisionTableProps {
  revisions: Revision[]
  latestRevision: number
  articleName?: string
  tenantId?: number | null
  onRevert?: (
    revNumber: number,
  ) => Promise<void>
}

export function RevisionTable({
  revisions,
  latestRevision,
  articleName,
  tenantId,
  onRevert,
}: RevisionTableProps) {
  const [viewDialog, setViewDialog] =
    useState(false)
  const [viewContent, setViewContent] =
    useState('')
  const [viewRev, setViewRev] =
    useState<Revision | null>(null)
  const [confirmRevert, setConfirmRevert] =
    useState<number | null>(null)

  const handleView = (rev: Revision) => {
    if (!articleName || !tenantId) return
    const url =
      `/api/articles/${articleName}`
      + `/revisions/${rev.number}`
      + `?tenant_id=${tenantId}`
    api
      .get(url)
      .then((res) => {
        setViewContent(
          DOMPurify.sanitize(
            res.data.content || '',
          ),
        )
        setViewRev(rev)
        setViewDialog(true)
      })
      .catch(() => {})
  }

  const handleRevert = () => {
    if (confirmRevert === null || !onRevert) {
      return
    }
    onRevert(confirmRevert)
      .then(() => setConfirmRevert(null))
      .catch(() => {})
  }

  return (
    <>
      <TableContainer
        component={Paper}
        variant="outlined"
      >
        <Table data-testid="revision-table">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>
                Rev #
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }}>
                Author
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }}>
                Date
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }}>
                Summary
              </TableCell>
              <TableCell
                sx={{ fontWeight: 600 }}
                align="right"
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {revisions.map((rev) => (
              <TableRow key={rev.number} hover>
                <TableCell>
                  {rev.number}
                </TableCell>
                <TableCell>
                  {rev.author}
                </TableCell>
                <TableCell>
                  {rev.date}
                </TableCell>
                <TableCell>
                  {rev.summary}
                </TableCell>
                <TableCell align="right">
                  <Box
                    sx={{
                      display: 'flex',
                      gap: 1,
                      justifyContent: 'flex-end',
                    }}
                  >
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={
                        <VisibilityOutlined />
                      }
                      onClick={() =>
                        handleView(rev)
                      }
                      data-testid={
                        `view-rev-${rev.number}`
                      }
                    >
                      View
                    </Button>
                    {rev.number
                      !== latestRevision && (
                      <Button
                        size="small"
                        variant="outlined"
                        color="warning"
                        startIcon={
                          <RestoreOutlined />
                        }
                        onClick={() =>
                          setConfirmRevert(
                            rev.number,
                          )
                        }
                        data-testid={
                          `revert-rev-`
                          + `${rev.number}`
                        }
                      >
                        Revert
                      </Button>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <RevisionViewDialog
        open={viewDialog}
        onClose={() => setViewDialog(false)}
        revision={viewRev}
        sanitizedContent={viewContent}
      />

      <RevertConfirmDialog
        revisionNumber={confirmRevert}
        onClose={() => setConfirmRevert(null)}
        onConfirm={handleRevert}
      />
    </>
  )
}
