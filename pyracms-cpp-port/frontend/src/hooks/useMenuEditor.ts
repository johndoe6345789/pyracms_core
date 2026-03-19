'use client'

import { useState } from 'react'
import { SelectChangeEvent } from '@mui/material'

export interface MenuItemRow {
  id: number
  name: string
  route: string
  position: number
  permissions: string
}

export interface MenuGroup {
  name: string
  items: MenuItemRow[]
}

const PLACEHOLDER_MENU_GROUPS: MenuGroup[] = [
  {
    name: 'main',
    items: [
      { id: 1, name: 'Home', route: '/', position: 0, permissions: 'public' },
      { id: 2, name: 'Articles', route: '/articles', position: 1, permissions: 'public' },
      { id: 3, name: 'Forum', route: '/forum', position: 2, permissions: 'authenticated' },
      { id: 4, name: 'Gallery', route: '/gallery', position: 3, permissions: 'public' },
    ],
  },
  {
    name: 'footer',
    items: [
      { id: 5, name: 'About', route: '/about', position: 0, permissions: 'public' },
      { id: 6, name: 'Contact', route: '/contact', position: 1, permissions: 'public' },
      { id: 7, name: 'Privacy Policy', route: '/privacy', position: 2, permissions: 'public' },
    ],
  },
  {
    name: 'user',
    items: [
      { id: 8, name: 'Profile', route: '/profile', position: 0, permissions: 'authenticated' },
      { id: 9, name: 'Settings', route: '/settings', position: 1, permissions: 'authenticated' },
      { id: 10, name: 'Logout', route: '/auth/logout', position: 2, permissions: 'authenticated' },
    ],
  },
]

export function useMenuEditor() {
  const [menuGroups, setMenuGroups] = useState<MenuGroup[]>(PLACEHOLDER_MENU_GROUPS)
  const [selectedGroup, setSelectedGroup] = useState('main')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editRow, setEditRow] = useState<MenuItemRow | null>(null)
  const [newName, setNewName] = useState('')
  const [newRoute, setNewRoute] = useState('')
  const [newPosition, setNewPosition] = useState('')
  const [newPermissions, setNewPermissions] = useState('public')
  const [groupDialogOpen, setGroupDialogOpen] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')

  const currentGroup = menuGroups.find((g) => g.name === selectedGroup)
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
    setMenuGroups((prev) =>
      prev.map((g) =>
        g.name === selectedGroup
          ? { ...g, items: g.items.map((i) => (i.id === editRow.id ? editRow : i)) }
          : g
      )
    )
    setEditingId(null)
    setEditRow(null)
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditRow(null)
  }

  const handleDelete = (id: number) => {
    setMenuGroups((prev) =>
      prev.map((g) =>
        g.name === selectedGroup
          ? { ...g, items: g.items.filter((i) => i.id !== id) }
          : g
      )
    )
  }

  const handleAddItem = () => {
    if (!newName.trim() || !newRoute.trim()) return
    const allIds = menuGroups.flatMap((g) => g.items.map((i) => i.id))
    const nextId = Math.max(...allIds, 0) + 1
    const newItem: MenuItemRow = {
      id: nextId,
      name: newName.trim(),
      route: newRoute.trim(),
      position: parseInt(newPosition, 10) || 0,
      permissions: newPermissions,
    }
    setMenuGroups((prev) =>
      prev.map((g) =>
        g.name === selectedGroup ? { ...g, items: [...g.items, newItem] } : g
      )
    )
    setNewName('')
    setNewRoute('')
    setNewPosition('')
    setNewPermissions('public')
  }

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) return
    const groupName = newGroupName.trim().toLowerCase().replace(/\s+/g, '_')
    if (menuGroups.some((g) => g.name === groupName)) return
    setMenuGroups((prev) => [...prev, { name: groupName, items: [] }])
    setSelectedGroup(groupName)
    setGroupDialogOpen(false)
    setNewGroupName('')
  }

  const handleOpenGroupDialog = () => setGroupDialogOpen(true)
  const handleCloseGroupDialog = () => setGroupDialogOpen(false)

  return {
    menuGroups,
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
