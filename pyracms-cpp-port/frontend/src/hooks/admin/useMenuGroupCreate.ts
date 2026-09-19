'use client'

import { useState } from 'react'
import api from '@/lib/api'
import { useActionError } from '../useActionError'
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
  const { error: groupError, setError, fail } = useActionError()

  const handleCreateGroup = () => {
    if (!newGroupName.trim() || !tenantId) return
    const name = newGroupName
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '_')
    if (menuGroups.some((g) => g.name === name)) return
    setError('')
    api
      .post('/api/menu-groups', { name, tenantId })
      .then((res) => {
        setMenuGroups((prev) => [
          ...prev,
          { id: res.data.id, name, items: [] },
        ])
        onCreated(name)
        setGroupDialogOpen(false)
        setNewGroupName('')
      })
      .catch(fail('Could not create menu group'))
  }

  return {
    groupDialogOpen, newGroupName, setNewGroupName,
    handleCreateGroup, groupError,
    handleOpenGroupDialog: () => setGroupDialogOpen(true),
    handleCloseGroupDialog: () => setGroupDialogOpen(false),
  }
}
