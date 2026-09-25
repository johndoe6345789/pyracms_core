import { TableCell, TableHead, TableRow } from '@mui/material'

const hdr = { fontWeight: 600 }

export function RevisionTableHead() {
  return (
    <TableHead>
      <TableRow>
        <TableCell sx={hdr}>Rev #</TableCell>
        <TableCell sx={hdr}>Author</TableCell>
        <TableCell sx={hdr}>Date</TableCell>
        <TableCell sx={hdr}>Summary</TableCell>
        <TableCell sx={hdr} align="right">
          Actions
        </TableCell>
      </TableRow>
    </TableHead>
  )
}
