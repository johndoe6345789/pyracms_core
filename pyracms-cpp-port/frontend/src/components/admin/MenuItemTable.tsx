import {
  Table,
  TableBody,
  TableContainer,
  TableRow,
  TableCell,
  Paper,
  Typography,
} from '@mui/material'
import { MenuItemRow } from '@/hooks/useMenuEditor'
import MenuItemTableRow from './MenuItemTableRow'
import MenuItemTableHead from './MenuItemTableHead'
import { orderMenuItems } from '@/hooks/admin/menuData'

interface MenuItemTableProps {
  items: MenuItemRow[]
  editingId: number | null
  editRow: MenuItemRow | null
  onEditRowChange: (
    updater: (prev: MenuItemRow | null) => MenuItemRow | null,
  ) => void
  onStartEdit: (item: MenuItemRow) => void
  onSaveEdit: () => void
  onCancelEdit: () => void
  onDelete: (id: number) => void
}

export default function MenuItemTable(p: MenuItemTableProps) {
  const { items } = p
  const folders = items.filter((i) => i.type === 'folder')
  return (
    <TableContainer
      component={Paper}
      variant="outlined"
      sx={{ borderColor: 'divider' }}
    >
      <Table>
        <MenuItemTableHead />
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
            orderMenuItems(items).map((item) => (
              <MenuItemTableRow
                key={item.id}
                item={item}
                editing={p.editingId === item.id}
                editRow={p.editRow}
                folders={folders}
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
