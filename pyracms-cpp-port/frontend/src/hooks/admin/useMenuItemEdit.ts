'use client'

import { useState } from 'react'
import api from '@/lib/api'
import { useActionError } from '../useActionError'
import { MenuItemRow, SetGroups, updateGroupItems } from './menuData'
import { invalidateSiteMenu } from '@/hooks/useSiteMenu'
import { toApiRoute } from '@/lib/menuRoute'

/** Inline edit and delete state for the items of the active group. */
export function useMenuItemEdit(
  selectedGroup: string,
  setMenuGroups: SetGroups,
) {
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editRow, setEditRow] = useState<MenuItemRow | null>(null)
  const { error: editError, setError, fail } = useActionError()

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditRow(null)
  }

  const handleStartEdit = (item: MenuItemRow) => {
    setEditingId(item.id)
    setEditRow({ ...item })
  }

  const handleSaveEdit = () => {
    if (!editRow) return
    const { name, route, position, permissions } = editRow
    setError('')
    api
      .put(`/api/menus/${editRow.id}`, {
        name,
        ...toApiRoute(route),
        position,
        permissions,
      })
      .then(() => {
        invalidateSiteMenu()
        setMenuGroups((prev) =>
          updateGroupItems(prev, selectedGroup, (items) =>
            items.map((i) => (i.id === editRow.id ? editRow : i)),
          ),
        )
        handleCancelEdit()
      })
      .catch(fail('Could not save menu item'))
  }

  const handleDelete = (id: number) => {
    setError('')
    api
      .delete(`/api/menus/${id}`)
      .then(() => {
        invalidateSiteMenu()
        setMenuGroups((prev) =>
          updateGroupItems(prev, selectedGroup, (items) =>
            items.filter((i) => i.id !== id),
          ),
        )
      })
      .catch(fail('Could not delete menu item'))
  }

  return {
    editingId,
    editRow,
    setEditRow,
    handleCancelEdit,
    handleStartEdit,
    handleSaveEdit,
    handleDelete,
    editError,
  }
}
