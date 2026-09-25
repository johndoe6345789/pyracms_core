import type { MenuItemRow } from '@/hooks/admin/menuData'

/** The add/edit form's fields. */
export interface MenuDraft {
  name: string
  kind: 'route' | 'folder'
  route: string
  /** folder it goes in, 0 = straight on the bar */
  parentId: number
  permissions: string
}

export const newDraft = (
  kind: MenuDraft['kind'] = 'route',
  parentId = 0,
): MenuDraft => ({
  name: '',
  kind,
  route: '',
  parentId,
  permissions: 'public',
})

export const draftOf = (i: MenuItemRow): MenuDraft => ({
  name: i.name,
  kind: i.type === 'folder' ? 'folder' : 'route',
  route: i.route,
  parentId: i.parentId,
  permissions: i.permissions,
})

export const PERMISSIONS: [string, string][] = [
  ['public', 'Everyone'],
  ['authenticated', 'Signed-in members'],
  ['admin', 'Admins only'],
]

export const permissionLabel = (value: string) =>
  PERMISSIONS.find(([v]) => v === value)?.[1] ?? value

/** Siblings (same folder) in display order. */
export function siblingsOf(items: MenuItemRow[], parentId: number) {
  return items
    .filter((i) => (i.parentId || 0) === parentId)
    .sort((a, b) => a.position - b.position || a.id - b.id)
}
