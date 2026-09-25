import { TableCell, TableHead, TableRow } from '@mui/material'

const HEADERS = ['Name', 'Route / URL', 'Position', 'Permissions']

export default function MenuItemTableHead() {
  return (
    <TableHead>
      <TableRow>
        {HEADERS.map((h) => (
          <TableCell key={h} sx={{ fontWeight: 700 }}>
            {h}
          </TableCell>
        ))}
        <TableCell sx={{ fontWeight: 700 }} align="right">
          Actions
        </TableCell>
      </TableRow>
    </TableHead>
  )
}
