'use client'

import { useState } from 'react'
import api from '@/lib/api'
import { menuItemBody } from '@/lib/menuItemPayload'
import { siblingsOf, type MenuDraft } from '@/lib/menuDraft'
import { validateRoute } from '@/lib/routeSuggest'
import { invalidateSiteMenu } from '@/hooks/useSiteMenu'
import { apiErrorMessage } from '@/lib/apiError'
import {
  updateGroupItems,
  type MenuGroup,
  type MenuItemRow,
  type SetGroups,
} from './menuData'

/**
 * Adding, editing, deleting and re-ordering the items of the open menu
 * group. New items go last in their folder; moving swaps neighbours and
 * numbers the whole level 1..n so the order is unambiguous.
 */
export function useMenuItems(
  group: MenuGroup | undefined,
  groupName: string,
  setGroups: SetGroups,
) {
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const items = group?.items ?? []
  const change = (fn: (rows: MenuItemRow[]) => MenuItemRow[]) => {
    invalidateSiteMenu()
    setGroups((prev) => updateGroupItems(prev, groupName, fn))
  }
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

  /** Create (no id) or save an item; resolves true when it worked. */
  const save = async (d: MenuDraft, id?: number) => {
    const bad = d.kind === 'route' ? validateRoute(d.route) : ''
    if (!group || !d.name.trim() || bad) return false
    const old = items.find((i) => i.id === id)
    const moved = !old || old.parentId !== d.parentId
    const last = siblingsOf(items, d.parentId).at(-1)
    const fields = {
      name: d.name.trim(),
      route: d.kind === 'folder' ? '' : d.route.trim(),
      position: moved ? (last?.position ?? 0) + 1 : (old?.position ?? 1),
      permissions: d.permissions,
      type: d.kind,
      parentId: d.kind === 'folder' ? 0 : d.parentId,
    }
    let ok = false
    await guard(async () => {
      if (old) {
        await api.put(`/api/menus/${old.id}`, menuItemBody(fields))
        change((rows) =>
          rows.map((r) => (r.id === old.id ? { ...fields, id: old.id } : r)),
        )
      } else {
        const res = await api.post(
          `/api/menu-groups/${group.id}/items`,
          menuItemBody(fields),
        )
        change((rows) => [...rows, { ...fields, id: res.data.id }])
      }
      ok = true
    }, 'Could not save the menu item')
    return ok
  }

  const remove = (id: number) =>
    guard(async () => {
      await api.delete(`/api/menus/${id}`)
      // links inside a deleted folder move to the top level (server side)
      change((rows) =>
        rows
          .filter((r) => r.id !== id)
          .map((r) => (r.parentId === id ? { ...r, parentId: 0 } : r)),
      )
    }, 'Could not delete the menu item')

  const move = (id: number, by: -1 | 1) => {
    const item = items.find((i) => i.id === id)
    if (!item) return Promise.resolve()
    const level = siblingsOf(items, item.parentId)
    const from = level.findIndex((i) => i.id === id)
    const to = from + by
    if (to < 0 || to >= level.length) return Promise.resolve()
    const order = [...level]
    order.splice(to, 0, order.splice(from, 1)[0] as MenuItemRow)
    const renumbered = order.map((r, n) => ({ ...r, position: n + 1 }))
    const changed = renumbered.filter(
      (r) => level.find((o) => o.id === r.id)?.position !== r.position,
    )
    return guard(async () => {
      await Promise.all(
        changed.map((r) =>
          api.put(`/api/menus/${r.id}`, { position: r.position }),
        ),
      )
      change((rows) =>
        rows.map((r) => renumbered.find((n) => n.id === r.id) ?? r),
      )
    }, 'Could not move the menu item')
  }

  return { error, busy, save, remove, move }
}
