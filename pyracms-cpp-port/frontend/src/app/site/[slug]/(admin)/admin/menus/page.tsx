'use client'

import { useParams } from 'next/navigation'
import { Box, Typography } from '@mui/material'
import MenuAddButtons from '@/components/admin/menus/MenuAddButtons'
import MenuDeleteDialog from '@/components/admin/menus/MenuDeleteDialog'
import MenuItemDialog from '@/components/admin/menus/MenuItemDialog'
import MenuPreview from '@/components/admin/menus/MenuPreview'
import MenuTree from '@/components/admin/menus/MenuTree'
import { ErrorAlert } from '@/components/common/ErrorAlert'
import { useMenuDialogs } from '@/hooks/admin/useMenuDialogs'
import { useMenuTargets } from '@/hooks/admin/useMenuTargets'
import { useMenuEditor } from '@/hooks/useMenuEditor'
import { useTenantId } from '@/hooks/useTenantId'

export default function AdminMenusPage() {
  const slug = useParams().slug as string
  const { tenantId } = useTenantId(slug)
  const editor = useMenuEditor(tenantId)
  const targets = useMenuTargets(tenantId)
  const ui = useMenuDialogs()
  const items = editor.currentItems
  const folders = items.filter((i) => i.type === 'folder')

  return (
    <Box data-testid="admin-menus-page">
      <Typography variant="h3" sx={{ mb: 1 }}>
        Menu Editor
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        The links along the top of your site. Group links into folders to make
        dropdowns, and use the arrows to put them in order.
      </Typography>
      <ErrorAlert error={editor.error} testId="menu-editor-error" />
      <MenuAddButtons onLink={() => ui.addLink()} onFolder={ui.addFolder} />
      <MenuPreview items={items} />
      <MenuTree
        items={items}
        targets={targets}
        busy={editor.busy}
        onMove={editor.move}
        onEdit={ui.edit}
        onDelete={ui.setDeleting}
        onAddInside={(f) => ui.addLink(f.id)}
        onAdd={() => ui.addLink()}
      />
      {ui.dialog && (
        <MenuItemDialog
          key={ui.dialog.key}
          title={ui.dialog.title}
          initial={ui.dialog.draft}
          editing={ui.dialog.editingId !== undefined}
          folders={folders}
          targets={targets}
          slug={slug}
          busy={editor.busy}
          onClose={ui.close}
          onSave={async (d) => {
            if (await editor.save(d, ui.dialog?.editingId)) ui.close()
          }}
        />
      )}
      <MenuDeleteDialog
        item={ui.deleting}
        onConfirm={(id) => editor.remove(id)}
        onClose={() => ui.setDeleting(null)}
      />
    </Box>
  )
}
