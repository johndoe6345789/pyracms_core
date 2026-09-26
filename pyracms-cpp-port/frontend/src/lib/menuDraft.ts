import type { MenuItemRow } from '@/hooks/admin/menuData'
import { validateRoute } from './routeSuggest'

/** The add/edit form's fields. */
export interface MenuDraft {
  name: string
  kind: 'route' | 'folder'
  route: string
  /** folder it goes in, 0 = straight on the bar */
  parentId: number
  permissions: string
  icon: string
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
  icon: '',
})

export const draftOf = (i: MenuItemRow): MenuDraft => ({
  name: i.name,
  kind: i.type === 'folder' ? 'folder' : 'route',
  route: i.route,
  parentId: i.parentId,
  permissions: i.permissions,
  icon: i.icon,
})

export const PERMISSIONS: [string, string][] = [
  ['public', 'Everyone'],
  ['authenticated', 'Signed-in members'],
  ['admin', 'Admins only'],
]

export const permissionLabel = (value: string) =>
  PERMISSIONS.find(([v]) => v === value)?.[1] ?? value

/** True when the draft cannot be saved yet (no name, or a link that is
 * missing or malformed; folders have no link). */
export const draftInvalid = (d: MenuDraft) =>
  !d.name.trim() ||
  (d.kind === 'route' && (!d.route.trim() || !!validateRoute(d.route.trim())))
