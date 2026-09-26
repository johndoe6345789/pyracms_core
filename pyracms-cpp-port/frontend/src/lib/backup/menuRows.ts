import type { MenuGroup } from '@/hooks/admin/menuData'

export interface Row {
  group: string
  name: string
  route: string
  type: string
  /** name of the folder it sits in, '' = top level */
  parent: string
  position: number
  permissions: string
  icon: string
}

export function rowsOf(groups: MenuGroup[]): Row[] {
  return groups.flatMap((g) =>
    g.items.map((i) => ({
      group: g.name,
      name: i.name,
      route: i.route,
      type: i.type,
      parent: g.items.find((p) => p.id === i.parentId)?.name ?? '',
      position: i.position,
      permissions: i.permissions,
      icon: i.icon,
    })),
  )
}

/** Folders first, so an item's folder exists before it is filed in it. */
export const folderFirst = (rows: Row[]) =>
  [...rows].sort((a, b) => Number(b.type === 'folder') - +(a.type === 'folder'))
