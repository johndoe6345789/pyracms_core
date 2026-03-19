import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Chip,
} from '@mui/material'
import { CheckCircleOutlined } from '@mui/icons-material'
import type { Revision } from '@/hooks/useGameDepDetail'

interface RevisionTableProps {
  revisions: Revision[]
}

export default function RevisionTable({ revisions }: RevisionTableProps) {
  return (
    <TableContainer component={Paper} variant="outlined">
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Version</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {revisions.map((rev) => (
            <TableRow key={rev.version}>
              <TableCell>
                <Typography variant="body2" fontWeight={600}>
                  {rev.version}
                </Typography>
              </TableCell>
              <TableCell>
                {new Date(rev.date).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <Chip
                  label={rev.published ? 'Published' : 'Draft'}
                  color={rev.published ? 'success' : 'default'}
                  size="small"
                  icon={rev.published ? <CheckCircleOutlined /> : undefined}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
