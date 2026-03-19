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
  Switch,
  IconButton,
} from '@mui/material'
import { AddOutlined, DeleteOutlined } from '@mui/icons-material'
import type { Revision } from '@/hooks/useGameDepDetail'

interface EditRevisionTableProps {
  revisions: Revision[]
  onCreateRevision?: () => void
  onDeleteRevision?: (version: string) => void
}

export default function EditRevisionTable({ revisions, onCreateRevision, onDeleteRevision }: EditRevisionTableProps) {
  return (
    <Paper variant="outlined" sx={{ p: 4, mb: 4, borderColor: 'divider' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">Revisions</Typography>
        <Button variant="outlined" startIcon={<AddOutlined />} size="small" onClick={onCreateRevision}>
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
              <TableRow key={rev.version}>
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>{rev.version}</Typography>
                </TableCell>
                <TableCell>{new Date(rev.date).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Switch defaultChecked={rev.published} size="small" />
                </TableCell>
                <TableCell align="right">
                  <IconButton size="small" color="error" onClick={() => onDeleteRevision?.(rev.version)}>
                    <DeleteOutlined fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  )
}
