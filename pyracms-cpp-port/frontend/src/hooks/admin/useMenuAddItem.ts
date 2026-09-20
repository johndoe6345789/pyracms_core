'use client'

import { useState } from 'react'
import api from '@/lib/api'
import { validateRoute } from '@/lib/routeSuggest'
import { toApiRoute } from '@/lib/menuRoute'
import { useActionError } from '../useActionError'
import { MenuGroup, MenuItemRow, SetGroups, updateGroupItems } from './menuData'
import { invalidateSiteMenu } from '@/hooks/useSiteMenu'

/**
 * Add-item form state and submit handler.
 * @param currentGroup - The active group, if any.
 * @param selectedGroup - Name of the active group.
 * @param setMenuGroups - State setter for all groups.
 */
export function useMenuAddItem(
  currentGroup: MenuGroup | undefined,
  selectedGroup: string,
  setMenuGroups: SetGroups,
) {
  const [newName, setNewName] = useState('')
  const [newRoute, setNewRoute] = useState('')
  const [newPosition, setNewPosition] = useState('')
  const [newPermissions, setNewPermissions] = useState('public')
  const { error: addError, setError, fail } = useActionError()

  const handleAddItem = () => {
    const name = newName.trim()
    const route = newRoute.trim()
    if (!name || !route || !currentGroup || validateRoute(route)) return
    const position = parseInt(newPosition, 10) || 0
    const permissions = newPermissions
    setError('')
    api
      .post(`/api/menu-groups/${currentGroup.id}/items`, {
        name,
        ...toApiRoute(route),
        position,
        permissions,
      })
      .then((res) => {
        invalidateSiteMenu()
        const item: MenuItemRow = {
          id: res.data.id,
          name,
          route,
          position,
          permissions,
        }
        setMenuGroups((prev) =>
          updateGroupItems(prev, selectedGroup, (items) => [...items, item]),
        )
        setNewName('')
        setNewRoute('')
        setNewPosition('')
        setNewPermissions('public')
      })
      .catch(fail('Could not add menu item'))
  }

  return {
    newName,
    setNewName,
    newRoute,
    setNewRoute,
    newPosition,
    setNewPosition,
    newPermissions,
    setNewPermissions,
    handleAddItem,
    addError,
  }
}
