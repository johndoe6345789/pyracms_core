'use client'

import { Typography, Box } from '@mui/material'
import { useMenuEditor } from '@/hooks/useMenuEditor'
import { useTenantId } from '@/hooks/useTenantId'
import { useParams } from 'next/navigation'
import MenuGroupSelect from
  '@/components/admin/MenuGroupSelect'
import MenuItemTable from
  '@/components/admin/MenuItemTable'
import AddMenuItemCard from
  '@/components/admin/menus/AddMenuItemCard'
import CreateGroupDialog from
  '@/components/admin/menus/CreateGroupDialog'

export default function AdminMenusPage() {
  const params = useParams()
  const slug = params.slug as string
  const { tenantId } = useTenantId(slug)
  const editor = useMenuEditor(tenantId)

  return (
    <Box data-testid="admin-menus-page">
      <Typography variant="h3" sx={{ mb: 1 }}>
        Menu Editor
      </Typography>
      <Typography
        variant="body1"
        color="text.secondary"
        sx={{ mb: 4 }}
      >
        Manage navigation menus and menu items.
      </Typography>
      <MenuGroupSelect
        menuGroups={editor.menuGroups}
        selectedGroup={editor.selectedGroup}
        onGroupChange={editor.handleGroupChange}
        onNewGroup={editor.handleOpenGroupDialog}
      />
      <AddMenuItemCard editor={editor} />
      <MenuItemTable
        items={editor.currentItems}
        editingId={editor.editingId}
        editRow={editor.editRow}
        onEditRowChange={editor.setEditRow}
        onStartEdit={editor.handleStartEdit}
        onSaveEdit={editor.handleSaveEdit}
        onCancelEdit={editor.handleCancelEdit}
        onDelete={editor.handleDelete}
      />
      <CreateGroupDialog editor={editor} />
    </Box>
  )
}
