import {
  Paper,
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import { AddOutlined } from '@mui/icons-material'
import RevisionRow from './RevisionRow'
import type { Revision } from '@/hooks/useGameDepDetail'

interface EditRevisionTableProps {
  revisions: Revision[]
  onCreateRevision?: () => void
  onDeleteRevision?: (version: string) => void
}

export default function EditRevisionTable({
  revisions,
  onCreateRevision,
  onDeleteRevision,
}: EditRevisionTableProps) {
  return (
    <Paper variant="outlined" sx={{ p: 4, mb: 4, borderColor: 'divider' }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Typography variant="h5">Revisions</Typography>
        <Button
          variant="outlined"
          startIcon={<AddOutlined />}
          size="small"
          onClick={onCreateRevision}
        >
          Create Revision
        </Button>
      </Box>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Version</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Published</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {revisions.map((rev) => (
              <RevisionRow
                key={rev.version}
                rev={rev}
                onDelete={onDeleteRevision}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  )
}
