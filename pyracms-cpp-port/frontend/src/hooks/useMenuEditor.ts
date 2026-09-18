'use client'

import { useState, useEffect } from 'react'
import { SelectChangeEvent } from '@mui/material'
import {
  MenuGroup, MenuItemRow, fetchMenuGroups,
} from './admin/menuData'
import { useMenuItemEdit } from './admin/useMenuItemEdit'
import { useMenuAddItem } from './admin/useMenuAddItem'
import { useMenuGroupCreate } from './admin/useMenuGroupCreate'

export type { MenuGroup, MenuItemRow }

/**
 * Hook that manages the full menu editor state including
 * CRUD operations for groups and items.
 * @param tenantId - The active tenant ID, or null.
 * @returns State values and handlers for the editor UI.
 */
export function useMenuEditor(tenantId: number | null) {
  const [menuGroups, setMenuGroups] = useState<MenuGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedGroup, setSelectedGroup] = useState('')

  useEffect(() => {
    if (!tenantId) return
    setLoading(true)
    fetchMenuGroups(tenantId)
      .then((loaded) => {
        setMenuGroups(loaded)
        const first = loaded[0]
        if (first && !selectedGroup) setSelectedGroup(first.name)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [tenantId])

  const currentGroup = menuGroups.find(
    (g) => g.name === selectedGroup,
  )
  const currentItems = currentGroup?.items ?? []
  const edit = useMenuItemEdit(selectedGroup, setMenuGroups)
  const add = useMenuAddItem(
    currentGroup, selectedGroup, setMenuGroups,
  )
  const create = useMenuGroupCreate(
    tenantId, menuGroups, setMenuGroups, setSelectedGroup,
  )

  const handleGroupChange = (e: SelectChangeEvent) => {
    setSelectedGroup(e.target.value)
    edit.handleCancelEdit()
  }

  return {
    menuGroups, loading, selectedGroup, currentItems,
    handleGroupChange,
    ...edit, ...add, ...create,
  }
}
