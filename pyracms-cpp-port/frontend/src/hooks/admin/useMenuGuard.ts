'use client'

import { useState } from 'react'
import { apiErrorMessage } from '@/lib/apiError'
import { invalidateSiteMenu } from '@/hooks/useSiteMenu'
import {
  updateGroupItems,
  type MenuGroup,
  type MenuItemRow,
  type SetGroups,
} from './menuData'

/** Busy/error state around a menu request, and the local-state update that
 * follows it (which also drops the site's cached menu). */
export function useMenuGuard(group: MenuGroup | undefined, set: SetGroups) {
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const guard = async (job: () => Promise<void>, fail: string) => {
    setBusy(true)
    setError('')
    try {
      await job()
    } catch (e) {
      setError(apiErrorMessage(e, fail))
    } finally {
      setBusy(false)
    }
  }
  const change = (
    fn: (rows: MenuItemRow[]) => MenuItemRow[],
    inGroup = group?.name ?? 'main',
  ) => {
    invalidateSiteMenu()
    set((prev) => updateGroupItems(prev, inGroup, fn))
  }
  return { error, busy, guard, change }
}

export type MenuGuard = ReturnType<typeof useMenuGuard>
