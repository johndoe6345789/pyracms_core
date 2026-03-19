'use client'

import { useState, useEffect } from 'react'
import { SelectChangeEvent } from '@mui/material'
import api from '@/lib/api'

export interface MenuItemRow {
  id: number
  name: string
  route: string
  position: number
  permissions: string
}

export interface MenuGroup {
  id: number
  name: string
  items: MenuItemRow[]
}

/**
 * Maps raw API item data to a MenuItemRow.
 * @param i - Raw record from the API response.
 * @returns A typed MenuItemRow object.
 */
function mapMenuItem(
  i: Record<string, unknown>
): MenuItemRow {
  return {
    id: i.id as number,
    name: (i.name as string) || '',
    route: (i.route as string) || '',
    position: (i.position as number) || 0,
    permissions: (i.permissions as string) || 'public',
  }
}

/**
 * Fetches all menu groups and their items for a
 * given tenant.
 * @param tenantId - The tenant to fetch groups for.
 * @returns An array of fully loaded MenuGroup objects.
 */
async function fetchMenuGroups(
  tenantId: number
): Promise<MenuGroup[]> {
  const res = await api.get(
    `/api/menu-groups?tenant_id=${tenantId}`
  )
  const groups = res.data || []
  const loaded: MenuGroup[] = []
  for (const g of groups) {
    const itemsRes = await api
      .get(`/api/menu-groups/${g.id}/items`)
      .catch(() => ({ data: [] }))
    loaded.push({
      id: g.id,
      name: g.name || '',
      items: (itemsRes.data || []).map(mapMenuItem),
    })
  }
  return loaded
}

/**
 * Updates an item within the matching group by name
 * and returns a new groups array.
 * @param groups - Current menu groups state.
 * @param groupName - The group to update within.
 * @param updater - Transform function for the items.
 * @returns A new array with the updated group.
 */
function updateGroupItems(
  groups: MenuGroup[],
  groupName: string,
  updater: (items: MenuItemRow[]) => MenuItemRow[]
): MenuGroup[] {
  return groups.map((g) =>
    g.name === groupName
      ? { ...g, items: updater(g.items) }
      : g
  )
}

/**
 * Hook that manages the full menu editor state
 * including CRUD operations for groups and items.
 * @param tenantId - The active tenant ID, or null.
 * @returns State values and handler functions for
 *   the menu editor UI.
 */
export function useMenuEditor(
  tenantId: number | null
) {
  const [menuGroups, setMenuGroups] =
    useState<MenuGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedGroup, setSelectedGroup] =
    useState('')
  const [editingId, setEditingId] =
    useState<number | null>(null)
  const [editRow, setEditRow] =
    useState<MenuItemRow | null>(null)
  const [newName, setNewName] = useState('')
  const [newRoute, setNewRoute] = useState('')
  const [newPosition, setNewPosition] = useState('')
  const [newPermissions, setNewPermissions] =
    useState('public')
  const [groupDialogOpen, setGroupDialogOpen] =
    useState(false)
  const [newGroupName, setNewGroupName] =
    useState('')

  useEffect(() => {
    if (!tenantId) return
    setLoading(true)
    fetchMenuGroups(tenantId)
      .then((loaded) => {
        setMenuGroups(loaded)
        if (loaded.length > 0 && !selectedGroup) {
          setSelectedGroup(loaded[0].name)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [tenantId])

  const currentGroup = menuGroups.find(
    (g) => g.name === selectedGroup
  )
  const currentItems = currentGroup?.items ?? []

  /** Handles group dropdown selection change. */
  const handleGroupChange = (
    e: SelectChangeEvent
  ) => {
    setSelectedGroup(e.target.value)
    setEditingId(null)
  }

  /** Starts inline editing for a menu item row. */
  const handleStartEdit = (item: MenuItemRow) => {
    setEditingId(item.id)
    setEditRow({ ...item })
  }

  /** Saves the currently edited row via the API. */
  const handleSaveEdit = () => {
    if (!editRow) return
    api
      .put(`/api/menus/${editRow.id}`, {
        name: editRow.name,
        route: editRow.route,
        position: editRow.position,
        permissions: editRow.permissions,
      })
      .then(() => {
        setMenuGroups((prev) =>
          updateGroupItems(
            prev,
            selectedGroup,
            (items) =>
              items.map((i) =>
                i.id === editRow.id ? editRow : i
              )
          )
        )
        setEditingId(null)
        setEditRow(null)
      })
      .catch(() => {})
  }

  /** Cancels the current inline edit. */
  const handleCancelEdit = () => {
    setEditingId(null)
    setEditRow(null)
  }

  /**
   * Deletes a menu item by ID via the API.
   * @param id - The menu item ID to delete.
   */
  const handleDelete = (id: number) => {
    api
      .delete(`/api/menus/${id}`)
      .then(() => {
        setMenuGroups((prev) =>
          updateGroupItems(
            prev,
            selectedGroup,
            (items) =>
              items.filter((i) => i.id !== id)
          )
        )
      })
      .catch(() => {})
  }

  /**
   * Adds a new menu item to the current group
   * using the form field state values.
   */
  const handleAddItem = () => {
    if (
      !newName.trim() ||
      !newRoute.trim() ||
      !currentGroup
    ) {
      return
    }
    const position =
      parseInt(newPosition, 10) || 0
    api
      .post(
        `/api/menu-groups/${currentGroup.id}/items`,
        {
          name: newName.trim(),
          route: newRoute.trim(),
          position,
          permissions: newPermissions,
        }
      )
      .then((res) => {
        const newItem: MenuItemRow = {
          id: res.data.id,
          name: newName.trim(),
          route: newRoute.trim(),
          position,
          permissions: newPermissions,
        }
        setMenuGroups((prev) =>
          updateGroupItems(
            prev,
            selectedGroup,
            (items) => [...items, newItem]
          )
        )
        setNewName('')
        setNewRoute('')
        setNewPosition('')
        setNewPermissions('public')
      })
      .catch(() => {})
  }

  /**
   * Creates a new menu group for the current
   * tenant using the dialog form state.
   */
  const handleCreateGroup = () => {
    if (!newGroupName.trim() || !tenantId) return
    const groupName = newGroupName
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '_')
    if (menuGroups.some((g) => g.name === groupName))
      return
    api
      .post('/api/menu-groups', {
        name: groupName,
        tenant_id: tenantId,
      })
      .then((res) => {
        setMenuGroups((prev) => [
          ...prev,
          { id: res.data.id, name: groupName, items: [] },
        ])
        setSelectedGroup(groupName)
        setGroupDialogOpen(false)
        setNewGroupName('')
      })
      .catch(() => {})
  }

  /** Opens the create-group dialog. */
  const handleOpenGroupDialog = () =>
    setGroupDialogOpen(true)

  /** Closes the create-group dialog. */
  const handleCloseGroupDialog = () =>
    setGroupDialogOpen(false)

  return {
    menuGroups,
    loading,
    selectedGroup,
    editingId,
    editRow,
    setEditRow,
    newName,
    setNewName,
    newRoute,
    setNewRoute,
    newPosition,
    setNewPosition,
    newPermissions,
    setNewPermissions,
    groupDialogOpen,
    newGroupName,
    setNewGroupName,
    currentItems,
    handleGroupChange,
    handleStartEdit,
    handleSaveEdit,
    handleCancelEdit,
    handleDelete,
    handleAddItem,
    handleCreateGroup,
    handleOpenGroupDialog,
    handleCloseGroupDialog,
  }
}
