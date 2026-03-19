import {
  TableCell, TextField,
  FormControl, Select, MenuItem,
} from '@mui/material'
import { MenuItemRow } from '@/hooks/useMenuEditor'

type Updater = (
  fn: (
    p: MenuItemRow | null
  ) => MenuItemRow | null
) => void

interface Props {
  editRow: MenuItemRow | null
  onEditRowChange: Updater
}

export default function MenuItemEditCells({
  editRow, onEditRowChange,
}: Props) {
  return (
    <>
      <TableCell>
        <TextField
          size="small"
          value={editRow?.name ?? ''}
          fullWidth
          data-testid="name-input"
          onChange={(e) =>
            onEditRowChange((p) =>
              p ? {
                ...p, name: e.target.value,
              } : p)}
        />
      </TableCell>
      <TableCell>
        <TextField
          size="small"
          value={editRow?.route ?? ''}
          fullWidth
          data-testid="route-input"
          onChange={(e) =>
            onEditRowChange((p) =>
              p ? {
                ...p, route: e.target.value,
              } : p)}
        />
      </TableCell>
      <TableCell>
        <TextField
          size="small" type="number"
          value={editRow?.position ?? 0}
          sx={{ width: 80 }}
          data-testid="position-input"
          onChange={(e) =>
            onEditRowChange((p) =>
              p ? {
                ...p,
                position: parseInt(
                  e.target.value, 10,
                ) || 0,
              } : p)}
        />
      </TableCell>
      <TableCell>
        <FormControl
          size="small"
          sx={{ minWidth: 130 }}
        >
          <Select
            value={
              editRow?.permissions ?? 'public'
            }
            data-testid="perms-select"
            onChange={(e) =>
              onEditRowChange((p) =>
                p ? {
                  ...p,
                  permissions: e.target.value,
                } : p)}
          >
            <MenuItem value="public">
              public
            </MenuItem>
            <MenuItem value="authenticated">
              authenticated
            </MenuItem>
            <MenuItem value="admin">
              admin
            </MenuItem>
          </Select>
        </FormControl>
      </TableCell>
    </>
  )
}
