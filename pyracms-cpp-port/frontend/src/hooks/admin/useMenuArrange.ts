'use client'

import api from '@/lib/api'
import { reordered } from '@/lib/menuOrder'
import type { MenuItemRow } from './menuData'
import type { MenuGuard } from './useMenuGuard'

/** Deleting and re-ordering entries of the menu. */
export function useMenuArrange(items: MenuItemRow[], g: MenuGuard) {
  const remove = (id: number) =>
    g.guard(async () => {
      await api.delete(`/api/menus/${id}`)
      // links inside a deleted folder move to the top level (server side)
      g.change((rows) =>
        rows
          .filter((r) => r.id !== id)
          .map((r) => (r.parentId === id ? { ...r, parentId: 0 } : r)),
      )
    }, 'Could not delete the menu item')

  const move = (id: number, by: -1 | 1) => {
    const changed = reordered(items, id, by)
    if (!changed?.length) return Promise.resolve()
    return g.guard(async () => {
      await Promise.all(
        changed.map((r) =>
          api.put(`/api/menus/${r.id}`, { position: r.position }),
        ),
      )
      g.change((rows) =>
        rows.map((r) => changed.find((n) => n.id === r.id) ?? r),
      )
    }, 'Could not move the menu item')
  }

  return { remove, move }
}
