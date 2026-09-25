import {
  TableCell,
  TextField,
  FormControl,
  Select,
  MenuItem,
} from '@mui/material'
import MenuItemEditRoute from './MenuItemEditRoute'
import { MenuItemRow } from '@/hooks/useMenuEditor'

type Updater = (fn: (p: MenuItemRow | null) => MenuItemRow | null) => void

interface Props {
  editRow: MenuItemRow | null
  folders: MenuItemRow[]
  onEditRowChange: Updater
}

const PERMS = ['public', 'authenticated', 'admin']

export default function MenuItemEditCells({
  editRow,
  folders,
  onEditRowChange,
}: Props) {
  const set = (patch: Partial<MenuItemRow>) =>
    onEditRowChange((p) => (p ? { ...p, ...patch } : p))
  return (
    <>
      <TableCell>
        <TextField
          size="small"
          value={editRow?.name ?? ''}
          fullWidth
          data-testid="name-input"
          onChange={(e) => set({ name: e.target.value })}
        />
      </TableCell>
      <MenuItemEditRoute editRow={editRow} folders={folders} onChange={set} />
      <TableCell>
        <TextField
          size="small"
          type="number"
          value={editRow?.position ?? 0}
          sx={{ width: 80 }}
          data-testid="position-input"
          onChange={(e) =>
            set({
              position: parseInt(e.target.value, 10) || 0,
            })
          }
        />
      </TableCell>
      <TableCell>
        <FormControl size="small" sx={{ minWidth: 130 }}>
          <Select
            value={editRow?.permissions ?? 'public'}
            data-testid="perms-select"
            onChange={(e) => set({ permissions: e.target.value })}
          >
            {PERMS.map((v) => (
              <MenuItem key={v} value={v}>
                {v}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </TableCell>
    </>
  )
}
