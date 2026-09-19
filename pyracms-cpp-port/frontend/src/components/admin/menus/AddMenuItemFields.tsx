import {
  TextField, FormControl, InputLabel, Select, MenuItem,
} from '@mui/material'
import type { useMenuEditor } from '@/hooks/useMenuEditor'

type Editor = ReturnType<typeof useMenuEditor>

export default function AddMenuItemFields({
  editor,
}: {
  editor: Editor
}) {
  return (
    <>
      <TextField
        label="Name"
        size="small"
        value={editor.newName}
        onChange={(e) => editor.setNewName(e.target.value)}
        sx={{ minWidth: 150 }}
        data-testid="menu-name-input"
      />
      <TextField
        label="Route / URL"
        size="small"
        value={editor.newRoute}
        onChange={(e) => editor.setNewRoute(e.target.value)}
        sx={{ minWidth: 200 }}
        data-testid="menu-route-input"
      />
      <TextField
        label="Position"
        size="small"
        type="number"
        value={editor.newPosition}
        onChange={(e) => editor.setNewPosition(e.target.value)}
        sx={{ width: 100 }}
        data-testid="menu-position-input"
      />
      <FormControl size="small" sx={{ minWidth: 150 }}>
        <InputLabel>Permissions</InputLabel>
        <Select
          value={editor.newPermissions}
          label="Permissions"
          onChange={(e) =>
            editor.setNewPermissions(e.target.value)}
          data-testid="menu-permissions-select"
        >
          <MenuItem value="public">public</MenuItem>
          <MenuItem value="authenticated">
            authenticated
          </MenuItem>
          <MenuItem value="admin">admin</MenuItem>
        </Select>
      </FormControl>
    </>
  )
}
