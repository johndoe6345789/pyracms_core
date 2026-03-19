'use client'

import {
  Typography, Box, Card, CardContent, TextField, Button,
  Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, MenuItem,
} from '@mui/material'
import { AddCircleOutline } from '@mui/icons-material'
import { useMenuEditor } from '@/hooks/useMenuEditor'
import { useTenantId } from '@/hooks/useTenantId'
import { useParams } from 'next/navigation'
import MenuGroupSelect from '@/components/admin/MenuGroupSelect'
import MenuItemTable from '@/components/admin/MenuItemTable'

export default function AdminMenusPage() {
  const params = useParams()
  const slug = params.slug as string
  const { tenantId } = useTenantId(slug)
  const editor = useMenuEditor(tenantId)

  return (
    <Box>
      <Typography variant="h3" sx={{ mb: 1 }}>Menu Editor</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Manage navigation menus and menu items.
      </Typography>
      <MenuGroupSelect
        menuGroups={editor.menuGroups} selectedGroup={editor.selectedGroup}
        onGroupChange={editor.handleGroupChange} onNewGroup={editor.handleOpenGroupDialog}
      />
      <Card variant="outlined" sx={{ borderColor: 'divider', mb: 4 }}>
        <CardContent>
          <Typography variant="h5" sx={{ mb: 2 }}>Add Menu Item</Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <TextField label="Name" size="small" value={editor.newName}
              onChange={(e) => editor.setNewName(e.target.value)} sx={{ minWidth: 150 }} />
            <TextField label="Route / URL" size="small" value={editor.newRoute}
              onChange={(e) => editor.setNewRoute(e.target.value)} sx={{ minWidth: 200 }} />
            <TextField label="Position" size="small" type="number" value={editor.newPosition}
              onChange={(e) => editor.setNewPosition(e.target.value)} sx={{ width: 100 }} />
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Permissions</InputLabel>
              <Select value={editor.newPermissions} label="Permissions"
                onChange={(e) => editor.setNewPermissions(e.target.value)}>
                <MenuItem value="public">public</MenuItem>
                <MenuItem value="authenticated">authenticated</MenuItem>
                <MenuItem value="admin">admin</MenuItem>
              </Select>
            </FormControl>
            <Button variant="contained" startIcon={<AddCircleOutline />}
              onClick={editor.handleAddItem}
              disabled={!editor.newName.trim() || !editor.newRoute.trim()}>
              Add Item
            </Button>
          </Box>
        </CardContent>
      </Card>
      <MenuItemTable
        items={editor.currentItems} editingId={editor.editingId}
        editRow={editor.editRow} onEditRowChange={editor.setEditRow}
        onStartEdit={editor.handleStartEdit} onSaveEdit={editor.handleSaveEdit}
        onCancelEdit={editor.handleCancelEdit} onDelete={editor.handleDelete}
      />
      <Dialog open={editor.groupDialogOpen} onClose={editor.handleCloseGroupDialog}>
        <DialogTitle>Create Menu Group</DialogTitle>
        <DialogContent>
          <TextField label="Group Name" fullWidth value={editor.newGroupName}
            onChange={(e) => editor.setNewGroupName(e.target.value)}
            sx={{ mt: 1 }} autoFocus
            onKeyDown={(e) => { if (e.key === 'Enter') editor.handleCreateGroup() }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={editor.handleCloseGroupDialog}>Cancel</Button>
          <Button onClick={editor.handleCreateGroup} variant="contained"
            disabled={!editor.newGroupName.trim()}>Create</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
