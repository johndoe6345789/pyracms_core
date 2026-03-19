import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, TextField, IconButton, Tooltip, Typography,
  FormControl, Select, MenuItem,
} from '@mui/material'
import { EditOutlined, DeleteOutlined, CheckOutlined, CloseOutlined } from '@mui/icons-material'
import { MenuItemRow } from '@/hooks/useMenuEditor'

interface MenuItemTableProps {
  items: MenuItemRow[]
  editingId: number | null
  editRow: MenuItemRow | null
  onEditRowChange: (updater: (prev: MenuItemRow | null) => MenuItemRow | null) => void
  onStartEdit: (item: MenuItemRow) => void
  onSaveEdit: () => void
  onCancelEdit: () => void
  onDelete: (id: number) => void
}

export default function MenuItemTable({
  items, editingId, editRow, onEditRowChange,
  onStartEdit, onSaveEdit, onCancelEdit, onDelete,
}: MenuItemTableProps) {
  return (
    <TableContainer component={Paper} variant="outlined" sx={{ borderColor: 'divider' }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Route / URL</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Position</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Permissions</TableCell>
            <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                <Typography color="text.secondary">
                  No items in this menu group. Add one above.
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            items.map((item) => {
              const editing = editingId === item.id
              return (
                <TableRow key={item.id} hover>
                  <TableCell>
                    {editing ? (
                      <TextField size="small" value={editRow?.name ?? ''} fullWidth
                        onChange={(e) => onEditRowChange((p) => p ? { ...p, name: e.target.value } : p)} />
                    ) : item.name}
                  </TableCell>
                  <TableCell>
                    {editing ? (
                      <TextField size="small" value={editRow?.route ?? ''} fullWidth
                        onChange={(e) => onEditRowChange((p) => p ? { ...p, route: e.target.value } : p)} />
                    ) : <Typography sx={{ fontFamily: 'monospace' }}>{item.route}</Typography>}
                  </TableCell>
                  <TableCell>
                    {editing ? (
                      <TextField size="small" type="number" value={editRow?.position ?? 0} sx={{ width: 80 }}
                        onChange={(e) => onEditRowChange((p) => p ? { ...p, position: parseInt(e.target.value, 10) || 0 } : p)} />
                    ) : item.position}
                  </TableCell>
                  <TableCell>
                    {editing ? (
                      <FormControl size="small" sx={{ minWidth: 130 }}>
                        <Select value={editRow?.permissions ?? 'public'}
                          onChange={(e) => onEditRowChange((p) => p ? { ...p, permissions: e.target.value } : p)}>
                          <MenuItem value="public">public</MenuItem>
                          <MenuItem value="authenticated">authenticated</MenuItem>
                          <MenuItem value="admin">admin</MenuItem>
                        </Select>
                      </FormControl>
                    ) : item.permissions}
                  </TableCell>
                  <TableCell align="right">
                    {editing ? (
                      <>
                        <Tooltip title="Save">
                          <IconButton size="small" color="success" onClick={onSaveEdit}>
                            <CheckOutlined fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Cancel">
                          <IconButton size="small" onClick={onCancelEdit}>
                            <CloseOutlined fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </>
                    ) : (
                      <>
                        <Tooltip title="Edit">
                          <IconButton size="small" color="primary" onClick={() => onStartEdit(item)}>
                            <EditOutlined fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" color="error" onClick={() => onDelete(item.id)}>
                            <DeleteOutlined fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
