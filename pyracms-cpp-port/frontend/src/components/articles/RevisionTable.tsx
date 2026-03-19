'use client'

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
import { VisibilityOutlined, RestoreOutlined } from '@mui/icons-material'
import type { Revision } from '@/hooks/useRevisions'

interface RevisionTableProps {
  revisions: Revision[]
  latestRevision: number
}

export function RevisionTable({ revisions, latestRevision }: RevisionTableProps) {
  return (
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
                  <Button size="small" variant="outlined" startIcon={<VisibilityOutlined />}>View</Button>
                  {rev.number !== latestRevision && (
                    <Button size="small" variant="outlined" color="warning" startIcon={<RestoreOutlined />}>Revert</Button>
                  )}
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
