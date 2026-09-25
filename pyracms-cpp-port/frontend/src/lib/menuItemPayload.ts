import { toApiRoute } from './menuRoute'

export interface MenuItemFields {
  name: string
  route: string
  position: number
  permissions: string
  /** 'route' (a link) or 'folder' (a dropdown holding links) */
  type: string
  /** id of the folder it is in, 0 = top level */
  parentId: number
}

/** The request body for creating or saving a menu item. A folder has no
 * link of its own and never sits inside another folder. */
export function menuItemBody(f: MenuItemFields) {
  const isFolder = f.type === 'folder'
  return {
    name: f.name,
    ...(isFolder
      ? { routePath: '', url: '', type: 'folder' }
      : toApiRoute(f.route)),
    position: f.position,
    permissions: f.permissions,
    parentId: isFolder ? 0 : f.parentId,
  }
}
