import { menuEntries } from '@/components/layout/siteMenu'

const item = (id: number, over: object = {}) => ({
  id,
  name: `Link ${id}`,
  route: '/about',
  position: id,
  permissions: 'public',
  type: 'route',
  parentId: 0,
  icon: '',
  ...over,
})

describe('menu folders', () => {
  const folder = { ...item(10, {}), name: 'Trainz', type: 'folder', route: '' }
  const inside = (id: number, over = {}) =>
    item(id, { parentId: 10, position: id, ...over })

  it('turns a folder into a dropdown of its visible links', () => {
    const out = menuEntries(
      'demo',
      [
        folder,
        inside(11),
        inside(12, { permissions: 'admin' }),
        item(1, { position: 0 }),
      ],
      { signedIn: false, canAdmin: false },
    )
    expect(out.map((e) => e.key)).toEqual(['menu-1', 'menu-10'])
    expect(out[1]?.children?.map((c) => c.key)).toEqual(['menu-11'])
    expect(out[1]?.href).toBe('')
  })

  it('hides a folder nobody can see into, and orphans surface', () => {
    const hidden = menuEntries(
      'demo',
      [folder, inside(11, { permissions: 'admin' })],
      { signedIn: false, canAdmin: false },
    )
    expect(hidden).toEqual([])
    const orphan = menuEntries('demo', [item(5, { parentId: 99 })], {
      signedIn: false,
      canAdmin: false,
    })
    expect(orphan.map((e) => e.key)).toEqual(['menu-5'])
  })
})

it('gives an entry its icon, and none for a missing or unknown name', () => {
  const view = { signedIn: false, canAdmin: false }
  const [a, b, c] = menuEntries(
    'demo',
    [
      item(1, { icon: 'TrainOutlined', position: 1 }),
      item(2, { icon: 'NoSuchIcon', position: 2 }),
      item(3, { position: 3 }),
    ],
    view,
  )
  expect(a?.icon).not.toBeNull()
  expect(b?.icon).toBeNull()
  expect(c?.icon).toBeNull()
})
