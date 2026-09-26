import { menuItemBody } from '@/lib/menuItemPayload'
import type { MenuItemRow } from '@/hooks/admin/menuData'

const row = (id: number, over: Partial<MenuItemRow> = {}): MenuItemRow => ({
  id,
  name: `n${id}`,
  route: '/x',
  position: id,
  permissions: 'public',
  type: 'route',
  parentId: 0,
  icon: '',
  ...over,
})

describe('menuItemBody', () => {
  it('sends a link with its route and folder', () => {
    expect(menuItemBody(row(1, { parentId: 7 }))).toEqual({
      name: 'n1',
      routePath: '/x',
      url: '',
      type: 'route',
      position: 1,
      permissions: 'public',
      parentId: 7,
      icon: '',
    })
  })

  it('sends a folder with no link and never inside another folder', () => {
    expect(menuItemBody(row(2, { type: 'folder', parentId: 7 }))).toMatchObject(
      { routePath: '', url: '', type: 'folder', parentId: 0 },
    )
  })
})
