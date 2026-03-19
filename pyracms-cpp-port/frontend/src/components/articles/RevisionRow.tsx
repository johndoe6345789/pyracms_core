'use client'

import {
  TableCell, TableRow, Box, Button,
} from '@mui/material'
import {
  VisibilityOutlined, RestoreOutlined,
} from '@mui/icons-material'
import type { Revision } from '@/hooks/useRevisions'

interface RevisionRowProps {
  rev: Revision
  isLatest: boolean
  onView: (rev: Revision) => void
  onRevert: (num: number) => void
}

export function RevisionRow({
  rev, isLatest, onView, onRevert,
}: RevisionRowProps) {
  return (
    <TableRow hover>
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
            startIcon={<VisibilityOutlined />}
            onClick={() => onView(rev)}
            data-testid={
              `view-rev-${rev.number}`}>
            View
          </Button>
          {!isLatest && (
            <Button size="small"
              variant="outlined"
              color="warning"
              startIcon={<RestoreOutlined />}
              onClick={() =>
                onRevert(rev.number)}
              data-testid={
                `revert-${rev.number}`}>
              Revert
            </Button>
          )}
        </Box>
      </TableCell>
    </TableRow>
  )
}
