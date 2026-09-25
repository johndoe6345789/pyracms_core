import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material'
import RouteField from './RouteField'
import MenuParentSelect from './MenuParentSelect'
import type { useMenuEditor } from '@/hooks/useMenuEditor'

type Editor = ReturnType<typeof useMenuEditor>

export default function AddMenuItemFields({ editor }: { editor: Editor }) {
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
      <FormControl size="small" sx={{ minWidth: 120 }}>
        <InputLabel>Kind</InputLabel>
        <Select
          value={editor.newType}
          label="Kind"
          onChange={(e) => editor.setNewType(e.target.value)}
          data-testid="menu-type-select"
        >
          <MenuItem value="route">Link</MenuItem>
          <MenuItem value="folder">Folder</MenuItem>
        </Select>
      </FormControl>
      {editor.newType === 'folder' ? null : (
        <>
          <RouteField
            value={editor.newRoute}
            onChange={editor.setNewRoute}
            testId="menu-route-input"
            minWidth={300}
          />
          <MenuParentSelect
            folders={editor.currentItems.filter((i) => i.type === 'folder')}
            value={editor.newParent}
            onChange={editor.setNewParent}
            testId="menu-parent-select"
          />
        </>
      )}
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
          onChange={(e) => editor.setNewPermissions(e.target.value)}
          data-testid="menu-permissions-select"
        >
          <MenuItem value="public">public</MenuItem>
          <MenuItem value="authenticated">authenticated</MenuItem>
          <MenuItem value="admin">admin</MenuItem>
        </Select>
      </FormControl>
    </>
  )
}
