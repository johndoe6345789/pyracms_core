import {
  Typography,
  TableCell,
  TableRow,
  Switch,
  IconButton,
} from '@mui/material'
import { DeleteOutlined } from '@mui/icons-material'
import type { Revision } from '@/hooks/useGameDepDetail'

interface Props {
  rev: Revision
  onDelete?: ((version: string) => void) | undefined
}

export default function RevisionRow({ rev, onDelete }: Props) {
  return (
    <TableRow>
      <TableCell>
        <Typography variant="body2" fontWeight={600}>
          {rev.version}
        </Typography>
      </TableCell>
      <TableCell>{new Date(rev.date).toLocaleDateString()}</TableCell>
      <TableCell>
        <Switch defaultChecked={rev.published} size="small" />
      </TableCell>
      <TableCell align="right">
        <IconButton
          size="small"
          color="error"
          aria-label={`Delete ${rev.version}`}
          onClick={() => onDelete?.(rev.version)}
        >
          <DeleteOutlined fontSize="small" />
        </IconButton>
      </TableCell>
    </TableRow>
  )
}
