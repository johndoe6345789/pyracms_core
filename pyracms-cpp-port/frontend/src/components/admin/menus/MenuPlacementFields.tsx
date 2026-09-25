import { MenuItem, TextField } from '@mui/material'
import { PERMISSIONS } from '@/lib/menuDraft'
import type { MenuItemRow } from '@/hooks/admin/menuData'

interface Props {
  isFolder: boolean
  folders: MenuItemRow[]
  parentId: number
  permissions: string
  onParent: (id: number) => void
  onPermissions: (value: string) => void
}

/** Which folder it sits in and who gets to see it. */
export default function MenuPlacementFields(p: Props) {
  return (
    <>
      {!p.isFolder && p.folders.length > 0 && (
        <TextField
          select
          label="Put it in"
          value={p.folders.some((f) => f.id === p.parentId) ? p.parentId : 0}
          onChange={(e) => p.onParent(Number(e.target.value))}
          data-testid="menu-parent-select"
        >
          <MenuItem value={0}>The top bar itself</MenuItem>
          {p.folders.map((f) => (
            <MenuItem key={f.id} value={f.id}>
              Folder: {f.name}
            </MenuItem>
          ))}
        </TextField>
      )}
      <TextField
        select
        label="Who can see it"
        value={p.permissions}
        onChange={(e) => p.onPermissions(e.target.value)}
        data-testid="menu-permissions-select"
      >
        {PERMISSIONS.map(([v, label]) => (
          <MenuItem key={v} value={v}>
            {label}
          </MenuItem>
        ))}
      </TextField>
    </>
  )
}
