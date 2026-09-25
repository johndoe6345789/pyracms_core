import { menuItemBody } from '@/lib/menuItemPayload'
import { orderMenuItems, type MenuItemRow } from '@/hooks/admin/menuData'

const row = (id: number, over: Partial<MenuItemRow> = {}): MenuItemRow => ({
  id,
  name: `n${id}`,
  route: '/x',
  position: id,
  permissions: 'public',
  type: 'route',
  parentId: 0,
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
    })
  })

  it('sends a folder with no link and never inside another folder', () => {
    expect(menuItemBody(row(2, { type: 'folder', parentId: 7 }))).toMatchObject(
      { routePath: '', url: '', type: 'folder', parentId: 0 },
    )
  })
})

describe('orderMenuItems', () => {
  it('puts each folder before its links, by position', () => {
    const items = [
      row(1, { type: 'folder', position: 5 }),
      row(2, { parentId: 1, position: 2 }),
      row(3, { parentId: 1, position: 1 }),
      row(4, { position: 1 }),
    ]
    expect(orderMenuItems(items).map((i) => i.id)).toEqual([4, 1, 3, 2])
  })

  it('keeps a link whose folder is gone at the top', () => {
    expect(orderMenuItems([row(1, { parentId: 9 })]).map((i) => i.id)).toEqual([
      1,
    ])
  })
})
