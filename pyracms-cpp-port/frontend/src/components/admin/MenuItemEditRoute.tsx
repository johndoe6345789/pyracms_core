import { TableCell, Typography } from '@mui/material'
import RouteField from './menus/RouteField'
import MenuParentSelect from './menus/MenuParentSelect'
import type { MenuItemRow } from '@/hooks/useMenuEditor'

interface Props {
  editRow: MenuItemRow | null
  folders: MenuItemRow[]
  onChange: (patch: Partial<MenuItemRow>) => void
}

/** The link cell of an item being edited: a route box and the folder it is
 * in, or just "Folder" for a folder. */
export default function MenuItemEditRoute({
  editRow,
  folders,
  onChange,
}: Props) {
  if (editRow?.type === 'folder')
    return (
      <TableCell>
        <Typography color="text.secondary">Folder</Typography>
      </TableCell>
    )
  return (
    <TableCell sx={{ display: 'grid', gap: 1 }}>
      <RouteField
        value={editRow?.route ?? ''}
        onChange={(route) => onChange({ route })}
        testId="route-input"
        minWidth={260}
        fullWidth
      />
      <MenuParentSelect
        folders={folders.filter((f) => f.id !== editRow?.id)}
        value={editRow?.parentId ?? 0}
        onChange={(parentId) => onChange({ parentId })}
        testId="parent-select"
      />
    </TableCell>
  )
}
