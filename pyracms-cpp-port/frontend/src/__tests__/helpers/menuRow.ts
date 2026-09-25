import type { MenuItemRow } from '@/hooks/admin/menuData'

/** A menu item as the editor holds it (a public link at the top level). */
export const menuRow = (over: Partial<MenuItemRow> = {}): MenuItemRow => ({
  id: 1,
  name: 'a',
  route: '/a',
  position: 0,
  permissions: 'public',
  type: 'route',
  parentId: 0,
  ...over,
})
