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

export function useMenuEditor(tenantId: number | null) {
  const [menuGroups, setMenuGroups] = useState<MenuGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedGroup, setSelectedGroup] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editRow, setEditRow] = useState<MenuItemRow | null>(null)
  const [newName, setNewName] = useState('')
  const [newRoute, setNewRoute] = useState('')
  const [newPosition, setNewPosition] = useState('')
  const [newPermissions, setNewPermissions] = useState('public')
  const [groupDialogOpen, setGroupDialogOpen] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')

  useEffect(() => {
    if (!tenantId) return
    setLoading(true)
    api.get(`/api/menu-groups?tenant_id=${tenantId}`)
      .then(async res => {
        const groups = res.data || []
        const loaded: MenuGroup[] = []
        for (const g of groups) {
          const itemsRes = await api.get(`/api/menu-groups/${g.id}/items`).catch(() => ({ data: [] }))
          loaded.push({
            id: g.id,
            name: g.name || '',
            items: (itemsRes.data || []).map((i: Record<string, unknown>) => ({
              id: i.id,
              name: i.name || '',
              route: i.route || '',
              position: i.position || 0,
              permissions: i.permissions || 'public',
            })),
          })
        }
        setMenuGroups(loaded)
        if (loaded.length > 0 && !selectedGroup) {
          setSelectedGroup(loaded[0].name)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [tenantId])

  const currentGroup = menuGroups.find(g => g.name === selectedGroup)
  const currentItems = currentGroup?.items ?? []

  const handleGroupChange = (e: SelectChangeEvent) => {
    setSelectedGroup(e.target.value)
    setEditingId(null)
  }

  const handleStartEdit = (item: MenuItemRow) => {
    setEditingId(item.id)
    setEditRow({ ...item })
  }

  const handleSaveEdit = () => {
    if (!editRow) return
    api.put(`/api/menus/${editRow.id}`, {
      name: editRow.name,
      route: editRow.route,
      position: editRow.position,
      permissions: editRow.permissions,
    }).then(() => {
      setMenuGroups(prev =>
        prev.map(g =>
          g.name === selectedGroup
            ? { ...g, items: g.items.map(i => i.id === editRow.id ? editRow : i) }
            : g
        )
      )
      setEditingId(null)
      setEditRow(null)
    }).catch(() => {})
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditRow(null)
  }

  const handleDelete = (id: number) => {
    api.delete(`/api/menus/${id}`)
      .then(() => {
        setMenuGroups(prev =>
          prev.map(g =>
            g.name === selectedGroup
              ? { ...g, items: g.items.filter(i => i.id !== id) }
              : g
          )
        )
      })
      .catch(() => {})
  }

  const handleAddItem = () => {
    if (!newName.trim() || !newRoute.trim() || !currentGroup) return
    api.post(`/api/menu-groups/${currentGroup.id}/items`, {
      name: newName.trim(),
      route: newRoute.trim(),
      position: parseInt(newPosition, 10) || 0,
      permissions: newPermissions,
    }).then(res => {
      const newItem: MenuItemRow = {
        id: res.data.id,
        name: newName.trim(),
        route: newRoute.trim(),
        position: parseInt(newPosition, 10) || 0,
        permissions: newPermissions,
      }
      setMenuGroups(prev =>
        prev.map(g =>
          g.name === selectedGroup ? { ...g, items: [...g.items, newItem] } : g
        )
      )
      setNewName('')
      setNewRoute('')
      setNewPosition('')
      setNewPermissions('public')
    }).catch(() => {})
  }

  const handleCreateGroup = () => {
    if (!newGroupName.trim() || !tenantId) return
    const groupName = newGroupName.trim().toLowerCase().replace(/\s+/g, '_')
    if (menuGroups.some(g => g.name === groupName)) return
    api.post('/api/menu-groups', { name: groupName, tenant_id: tenantId })
      .then(res => {
        setMenuGroups(prev => [...prev, { id: res.data.id, name: groupName, items: [] }])
        setSelectedGroup(groupName)
        setGroupDialogOpen(false)
        setNewGroupName('')
      })
      .catch(() => {})
  }

  const handleOpenGroupDialog = () => setGroupDialogOpen(true)
  const handleCloseGroupDialog = () => setGroupDialogOpen(false)

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
