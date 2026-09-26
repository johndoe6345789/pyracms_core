'use client'

import { useState, useEffect } from 'react'
import {
  MenuGroup,
  MenuItemRow,
  createMenuGroup,
  fetchMenuGroups,
} from './admin/menuData'
import { useMenuItems } from './admin/useMenuItems'
import { pickTopGroup } from './useSiteMenu'

export type { MenuGroup, MenuItemRow }

/**
 * The site's menu: its links and folders (add, edit, delete, re-order).
 * There is one top menu per site (the group the site shows along the top);
 * it is created the first time something is added.
 * @param tenantId - The active tenant ID, or null.
 */
export function useMenuEditor(tenantId: number | null) {
  const [menuGroups, setMenuGroups] = useState<MenuGroup[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!tenantId) return
    setLoading(true)
    fetchMenuGroups(tenantId)
      .then(setMenuGroups)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [tenantId])

  const group = pickTopGroup(menuGroups)
  const items = useMenuItems(group, setMenuGroups, async () => {
    if (!tenantId) throw new Error('No site')
    const made = await createMenuGroup(tenantId)
    setMenuGroups((prev) => [...prev, made])
    return made
  })

  return {
    loading,
    currentItems: group?.items ?? [],
    error: items.error,
    busy: items.busy,
    save: items.save,
    remove: items.remove,
    move: items.move,
  }
}
