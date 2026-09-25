'use client'

import { useState, useEffect } from 'react'
import { SelectChangeEvent } from '@mui/material'
import { MenuGroup, MenuItemRow, fetchMenuGroups } from './admin/menuData'
import { useMenuItems } from './admin/useMenuItems'
import { useMenuGroupCreate } from './admin/useMenuGroupCreate'

export type { MenuGroup, MenuItemRow }

/**
 * The menu editor: the site's menu groups, the open group's items (add,
 * edit, delete, re-order) and creating new groups.
 * @param tenantId - The active tenant ID, or null.
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
        // Keep the user's choice if they already picked a group
        if (first) setSelectedGroup((cur) => cur || first.name)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [tenantId])

  const currentGroup = menuGroups.find((g) => g.name === selectedGroup)
  const items = useMenuItems(currentGroup, selectedGroup, setMenuGroups)
  const create = useMenuGroupCreate(
    tenantId,
    menuGroups,
    setMenuGroups,
    setSelectedGroup,
  )

  const handleGroupChange = (e: SelectChangeEvent) =>
    setSelectedGroup(e.target.value)

  return {
    menuGroups,
    loading,
    selectedGroup,
    currentItems: currentGroup?.items ?? [],
    handleGroupChange,
    error: items.error || create.groupError,
    busy: items.busy,
    save: items.save,
    remove: items.remove,
    move: items.move,
    ...create,
  }
}
