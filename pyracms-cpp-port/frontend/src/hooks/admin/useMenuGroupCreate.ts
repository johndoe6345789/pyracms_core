'use client'

import { useState } from 'react'
import api from '@/lib/api'
import { MenuGroup, SetGroups } from './menuData'

/**
 * Create-group dialog state and submit handler.
 * @param tenantId - The active tenant ID, or null.
 * @param menuGroups - Existing groups (for duplicate check).
 * @param setMenuGroups - State setter for all groups.
 * @param onCreated - Called with the new group name.
 */
export function useMenuGroupCreate(
  tenantId: number | null,
  menuGroups: MenuGroup[],
  setMenuGroups: SetGroups,
  onCreated: (name: string) => void,
) {
  const [groupDialogOpen, setGroupDialogOpen] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')

  const handleCreateGroup = () => {
    if (!newGroupName.trim() || !tenantId) return
    const name = newGroupName
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '_')
    if (menuGroups.some((g) => g.name === name)) return
    api
      .post('/api/menu-groups', { name, tenant_id: tenantId })
      .then((res) => {
        setMenuGroups((prev) => [
          ...prev,
          { id: res.data.id, name, items: [] },
        ])
        onCreated(name)
        setGroupDialogOpen(false)
        setNewGroupName('')
      })
      .catch(() => {})
  }

  return {
    groupDialogOpen, newGroupName, setNewGroupName,
    handleCreateGroup,
    handleOpenGroupDialog: () => setGroupDialogOpen(true),
    handleCloseGroupDialog: () => setGroupDialogOpen(false),
  }
}
