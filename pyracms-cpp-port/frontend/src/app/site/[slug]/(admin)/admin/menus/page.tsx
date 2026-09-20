'use client'

import { Typography, Box } from '@mui/material'
import { useMenuEditor } from '@/hooks/useMenuEditor'
import { useTenantId } from '@/hooks/useTenantId'
import { useParams } from 'next/navigation'
import MenuGroupSelect from '@/components/admin/MenuGroupSelect'
import MenuItemTable from '@/components/admin/MenuItemTable'
import AddMenuItemCard from '@/components/admin/menus/AddMenuItemCard'
import { ErrorAlert } from '@/components/common/ErrorAlert'
import CreateGroupDialog from '@/components/admin/menus/CreateGroupDialog'

const INTRO = [
  'Your links along the top of the site, in your own words.',
  'The group called "main" is shown (if there is none, the first group',
  'with links). Stock pages such as Articles and Forum stay under Explore.',
  'Each link can be public, for signed-in members, or for admins only.',
]

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
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        {INTRO.join(' ')}
      </Typography>
      <ErrorAlert error={editor.error} testId="menu-editor-error" />
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
