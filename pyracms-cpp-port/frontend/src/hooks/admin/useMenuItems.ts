'use client'

import api from '@/lib/api'
import { menuItemBody } from '@/lib/menuItemPayload'
import { draftInvalid, type MenuDraft } from '@/lib/menuDraft'
import { fieldsOf } from '@/lib/menuOrder'
import type { MenuGroup, SetGroups } from './menuData'
import { useMenuArrange } from './useMenuArrange'
import { useMenuGuard } from './useMenuGuard'

/**
 * Adding, editing, deleting and re-ordering the items of the site's menu
 * (`ensureGroup` makes the menu itself the first time something is added).
 * New items go last in their folder; moving swaps neighbours and numbers the
 * whole level 1..n so the order is unambiguous.
 */
export function useMenuItems(
  group: MenuGroup | undefined,
  setGroups: SetGroups,
  ensureGroup: () => Promise<MenuGroup>,
) {
  const g = useMenuGuard(group, setGroups)
  const items = group?.items ?? []

  /** Create (no id) or save an item; resolves true when it worked. */
  const save = async (d: MenuDraft, id?: number) => {
    if (draftInvalid(d)) return false
    const old = items.find((i) => i.id === id)
    const fields = fieldsOf(d, old, items)
    let ok = false
    await g.guard(async () => {
      if (old) {
        await api.put(`/api/menus/${old.id}`, menuItemBody(fields))
        g.change((rows) =>
          rows.map((r) => (r.id === old.id ? { ...fields, id: old.id } : r)),
        )
      } else {
        const target = group ?? (await ensureGroup())
        const res = await api.post(
          `/api/menu-groups/${target.id}/items`,
          menuItemBody(fields),
        )
        g.change(
          (rows) => [...rows, { ...fields, id: res.data.id }],
          target.name,
        )
      }
      ok = true
    }, 'Could not save the menu item')
    return ok
  }

  return { error: g.error, busy: g.busy, save, ...useMenuArrange(items, g) }
}
