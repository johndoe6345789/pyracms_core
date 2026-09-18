import {
  Typography, Box, Card, CardContent, TextField,
  Button, FormControl, InputLabel, Select, MenuItem,
} from '@mui/material'
import { AddCircleOutline } from '@mui/icons-material'
import type { useMenuEditor } from '@/hooks/useMenuEditor'

type Editor = ReturnType<typeof useMenuEditor>

export default function AddMenuItemCard({
  editor,
}: {
  editor: Editor
}) {
  return (
    <Card
      variant="outlined"
      sx={{ borderColor: 'divider', mb: 4 }}
    >
      <CardContent>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Add Menu Item
        </Typography>
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            alignItems: 'flex-start',
            flexWrap: 'wrap',
          }}
        >
          <TextField
            label="Name"
            size="small"
            value={editor.newName}
            onChange={(e) =>
              editor.setNewName(e.target.value)
            }
            sx={{ minWidth: 150 }}
            data-testid="menu-name-input"
          />
          <TextField
            label="Route / URL"
            size="small"
            value={editor.newRoute}
            onChange={(e) =>
              editor.setNewRoute(e.target.value)
            }
            sx={{ minWidth: 200 }}
            data-testid="menu-route-input"
          />
          <TextField
            label="Position"
            size="small"
            type="number"
            value={editor.newPosition}
            onChange={(e) =>
              editor.setNewPosition(e.target.value)
            }
            sx={{ width: 100 }}
            data-testid="menu-position-input"
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Permissions</InputLabel>
            <Select
              value={editor.newPermissions}
              label="Permissions"
              onChange={(e) =>
                editor.setNewPermissions(e.target.value)
              }
              data-testid="menu-permissions-select"
            >
              <MenuItem value="public">public</MenuItem>
              <MenuItem value="authenticated">
                authenticated
              </MenuItem>
              <MenuItem value="admin">admin</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            startIcon={<AddCircleOutline />}
            onClick={editor.handleAddItem}
            disabled={
              !editor.newName.trim() ||
              !editor.newRoute.trim()
            }
            data-testid="add-menu-item-btn"
          >
            Add Item
          </Button>
        </Box>
      </CardContent>
    </Card>
  )
}
