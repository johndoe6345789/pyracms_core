'use client'

import { useState } from 'react'
import api from '@/lib/api'
import {
  MenuItemRow, SetGroups, updateGroupItems,
} from './menuData'

/**
 * Inline edit and delete state for menu items.
 * @param selectedGroup - Name of the active group.
 * @param setMenuGroups - State setter for all groups.
 */
export function useMenuItemEdit(
  selectedGroup: string,
  setMenuGroups: SetGroups,
) {
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editRow, setEditRow] = useState<MenuItemRow | null>(null)

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
    api
      .put(`/api/menus/${editRow.id}`, {
        name, route, position, permissions,
      })
      .then(() => {
        setMenuGroups((prev) =>
          updateGroupItems(prev, selectedGroup, (items) =>
            items.map((i) => (i.id === editRow.id ? editRow : i))))
        handleCancelEdit()
      })
      .catch(() => {})
  }

  const handleDelete = (id: number) => {
    api
      .delete(`/api/menus/${id}`)
      .then(() => {
        setMenuGroups((prev) =>
          updateGroupItems(prev, selectedGroup, (items) =>
            items.filter((i) => i.id !== id)))
      })
      .catch(() => {})
  }

  return {
    editingId, editRow, setEditRow, handleCancelEdit,
    handleStartEdit, handleSaveEdit, handleDelete,
  }
}
