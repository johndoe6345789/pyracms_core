import api from '@/lib/api'
import { fromApiRoute } from '@/lib/menuRoute'

export interface MenuItemRow {
  id: number
  name: string
  route: string
  position: number
  permissions: string
  /** 'route' (a link) or 'folder' (a dropdown holding links) */
  type: string
  /** the folder this item is in, 0 = top level */
  parentId: number
}

export interface MenuGroup {
  id: number
  name: string
  items: MenuItemRow[]
}

/** Maps raw API item data to a MenuItemRow. */
function mapMenuItem(i: Record<string, unknown>): MenuItemRow {
  return {
    id: i.id as number,
    name: (i.name as string) || '',
    route: fromApiRoute(i),
    position: (i.position as number) || 0,
    permissions: (i.permissions as string) || 'public',
    type: (i.type as string) || 'route',
    parentId: (i.parentId as number) || 0,
  }
}

/** Fetches all menu groups and their items for a tenant. */
export async function fetchMenuGroups(tenantId: number): Promise<MenuGroup[]> {
  const res = await api.get(`/api/menu-groups?tenant_id=${tenantId}`)
  const loaded: MenuGroup[] = []
  for (const g of res.data || []) {
    const itemsRes = await api
      .get(`/api/menu-groups/${g.id}/items`)
      .catch(() => ({ data: [] }))
    loaded.push({
      id: g.id,
      name: g.name || '',
      items: (itemsRes.data || []).map(mapMenuItem),
    })
  }
  return loaded
}

/** Applies an updater to the items of the named group. */
export function updateGroupItems(
  groups: MenuGroup[],
  groupName: string,
  updater: (items: MenuItemRow[]) => MenuItemRow[],
): MenuGroup[] {
  return groups.map((g) =>
    g.name === groupName ? { ...g, items: updater(g.items) } : g,
  )
}

export type SetGroups = React.Dispatch<React.SetStateAction<MenuGroup[]>>

/** Items in display order: top-level entries by position, each folder
 * followed by the links inside it. */
export function orderMenuItems(items: MenuItemRow[]): MenuItemRow[] {
  const by = (a: MenuItemRow, b: MenuItemRow) =>
    a.position - b.position || a.id - b.id
  const ids = new Set(items.map((i) => i.id))
  const top = items.filter((i) => !i.parentId || !ids.has(i.parentId))
  return [...top]
    .sort(by)
    .flatMap((i) => [i, ...items.filter((c) => c.parentId === i.id).sort(by)])
}
