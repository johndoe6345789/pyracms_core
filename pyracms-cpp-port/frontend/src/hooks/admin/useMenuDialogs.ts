'use client'

import { useState } from 'react'
import { draftOf, newDraft, type MenuDraft } from '@/lib/menuDraft'
import type { MenuItemRow } from './menuData'

export interface OpenDialog {
  key: string
  title: string
  draft: MenuDraft
  editingId?: number
}

/** Which add/edit dialog is open, and which entry is about to be deleted. */
export function useMenuDialogs() {
  const [dialog, setDialog] = useState<OpenDialog | null>(null)
  const [deleting, setDeleting] = useState<MenuItemRow | null>(null)
  return {
    dialog,
    deleting,
    setDeleting,
    close: () => setDialog(null),
    addLink: (parentId = 0) =>
      setDialog({
        key: `add-${Date.now()}`,
        title: 'Add a link',
        draft: newDraft('route', parentId),
      }),
    addFolder: () =>
      setDialog({
        key: `add-${Date.now()}`,
        title: 'Add a folder',
        draft: newDraft('folder'),
      }),
    edit: (item: MenuItemRow) =>
      setDialog({
        key: `edit-${item.id}`,
        title: `Edit "${item.name}"`,
        draft: draftOf(item),
        editingId: item.id,
      }),
  }
}
