import {
  Table, TableBody, TableContainer, TableHead, TableRow,
  TableCell, Paper, Typography,
} from '@mui/material'
import { MenuItemRow } from '@/hooks/useMenuEditor'
import MenuItemTableRow from './MenuItemTableRow'

interface MenuItemTableProps {
  items: MenuItemRow[]
  editingId: number | null
  editRow: MenuItemRow | null
  onEditRowChange: (
    updater: (prev: MenuItemRow | null) => MenuItemRow | null
  ) => void
  onStartEdit: (item: MenuItemRow) => void
  onSaveEdit: () => void
  onCancelEdit: () => void
  onDelete: (id: number) => void
}

const HEADERS = [
  'Name', 'Route / URL', 'Position', 'Permissions',
]

export default function MenuItemTable(p: MenuItemTableProps) {
  const { items } = p
  return (
    <TableContainer
      component={Paper}
      variant="outlined"
      sx={{ borderColor: 'divider' }}
    >
      <Table>
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
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                <Typography color="text.secondary">
                  No items. Add one above.
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            items.map((item) => (
              <MenuItemTableRow
                key={item.id}
                item={item}
                editing={p.editingId === item.id}
                editRow={p.editRow}
                onEditRowChange={p.onEditRowChange}
                onStartEdit={p.onStartEdit}
                onSaveEdit={p.onSaveEdit}
                onCancelEdit={p.onCancelEdit}
                onDelete={p.onDelete}
              />
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
