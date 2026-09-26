import type { MenuItemRow } from '@/hooks/admin/menuData'
import type { MenuItemFields } from './menuItemPayload'
import type { MenuDraft } from './menuDraft'

/** Siblings (same folder) in display order. */
export function siblingsOf(items: MenuItemRow[], parentId: number) {
  return items
    .filter((i) => (i.parentId || 0) === parentId)
    .sort((a, b) => a.position - b.position || a.id - b.id)
}

/** The fields to send for a draft: a new (or moved) item goes last in its
 * folder, an edited one keeps its place. */
export function fieldsOf(
  d: MenuDraft,
  old: MenuItemRow | undefined,
  items: MenuItemRow[],
): MenuItemFields {
  const moved = !old || old.parentId !== d.parentId
  const last = siblingsOf(items, d.parentId).at(-1)
  return {
    name: d.name.trim(),
    route: d.kind === 'folder' ? '' : d.route.trim(),
    position: moved ? (last?.position ?? 0) + 1 : (old?.position ?? 1),
    permissions: d.permissions,
    type: d.kind,
    parentId: d.kind === 'folder' ? 0 : d.parentId,
  }
}

/** The item's level renumbered 1..n after moving it one step; null when it
 * cannot move that way. Only the rows whose number changed are returned. */
export function reordered(
  items: MenuItemRow[],
  id: number,
  by: -1 | 1,
): MenuItemRow[] | null {
  const item = items.find((i) => i.id === id)
  if (!item) return null
  const level = siblingsOf(items, item.parentId)
  const from = level.findIndex((i) => i.id === id)
  const to = from + by
  if (to < 0 || to >= level.length) return null
  const order = [...level]
  order.splice(to, 0, order.splice(from, 1)[0] as MenuItemRow)
  return order
    .map((r, n) => ({ ...r, position: n + 1 }))
    .filter((r) => level.find((o) => o.id === r.id)?.position !== r.position)
}
