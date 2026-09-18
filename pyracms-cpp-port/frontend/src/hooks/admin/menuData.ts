import api from '@/lib/api'

export interface MenuItemRow {
  id: number
  name: string
  route: string
  position: number
  permissions: string
}

export interface MenuGroup {
  id: number
  name: string
  items: MenuItemRow[]
}

/** Maps raw API item data to a MenuItemRow. */
export function mapMenuItem(
  i: Record<string, unknown>,
): MenuItemRow {
  return {
    id: i.id as number,
    name: (i.name as string) || '',
    route: (i.route as string) || '',
    position: (i.position as number) || 0,
    permissions: (i.permissions as string) || 'public',
  }
}

/** Fetches all menu groups and their items for a tenant. */
export async function fetchMenuGroups(
  tenantId: number,
): Promise<MenuGroup[]> {
  const res = await api.get(
    `/api/menu-groups?tenant_id=${tenantId}`,
  )
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
    g.name === groupName
      ? { ...g, items: updater(g.items) }
      : g,
  )
}

export type SetGroups = React.Dispatch<
  React.SetStateAction<MenuGroup[]>
>
