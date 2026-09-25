'use client'

import api from '@/lib/api'
import { validateRoute } from '@/lib/routeSuggest'
import { menuItemBody } from '@/lib/menuItemPayload'
import { useActionError } from '../useActionError'
import { MenuGroup, MenuItemRow, SetGroups, updateGroupItems } from './menuData'
import { useNewMenuItemForm } from './useNewMenuItemForm'
import { invalidateSiteMenu } from '@/hooks/useSiteMenu'

/**
 * Add-item form state and submit handler (a link, or a folder that holds
 * links).
 * @param currentGroup - The active group, if any.
 * @param selectedGroup - Name of the active group.
 * @param setMenuGroups - State setter for all groups.
 */
export function useMenuAddItem(
  currentGroup: MenuGroup | undefined,
  selectedGroup: string,
  setMenuGroups: SetGroups,
) {
  const { fields: f, reset } = useNewMenuItemForm()
  const { error: addError, setError, fail } = useActionError()

  const handleAddItem = () => {
    const name = f.newName.trim()
    const route = f.newRoute.trim()
    const folder = f.newType === 'folder'
    if (!name || !currentGroup) return
    if (!folder && (!route || validateRoute(route))) return
    const item: Omit<MenuItemRow, 'id'> = {
      name,
      route: folder ? '' : route,
      position: parseInt(f.newPosition, 10) || 0,
      permissions: f.newPermissions,
      type: f.newType,
      parentId: folder ? 0 : f.newParent,
    }
    setError('')
    api
      .post(`/api/menu-groups/${currentGroup.id}/items`, menuItemBody(item))
      .then((res) => {
        invalidateSiteMenu()
        setMenuGroups((prev) =>
          updateGroupItems(prev, selectedGroup, (items) => [
            ...items,
            { ...item, id: res.data.id },
          ]),
        )
        reset()
      })
      .catch(fail('Could not add menu item'))
  }

  return { ...f, handleAddItem, addError }
}
