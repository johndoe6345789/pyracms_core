import { m, noop } from '../../helpers/backupSetup'
import { menuSection } from '@/lib/backup/menu'

const item = (o: object) => ({
  id: 1,
  name: 'x',
  routePath: '/x',
  position: 1,
  permissions: 'public',
  type: 'route',
  parentId: 0,
  icon: '',
  ...o,
})

const row = (o: object) => ({
  group: 'main',
  type: 'route',
  parent: '',
  position: 0,
  permissions: 'public',
  icon: '',
  ...o,
})

function menuApi(items: object[]) {
  m.get.mockImplementation((url: string) =>
    Promise.resolve({
      data: url.endsWith('/items') ? items : [{ id: 1, name: 'main' }],
    }),
  )
}

it('restores folders first, then links, updating matches', async () => {
  menuApi([item({ id: 9, name: 'Home' })])
  const rows = [
    row({ name: 'Guide', route: '/g', parent: 'Docs', icon: 'Book' }),
    row({ name: 'Docs', route: '', type: 'folder' }),
    row({ name: 'Home', route: '/', icon: 'Home' }),
    row({ group: 'other', name: 'Solo', route: 'https://a.b' }),
  ]
  const out = await menuSection.restore(rows, 1, noop)
  expect(out).toMatchObject({ created: 3, updated: 1, failed: [] })
  expect(m.post.mock.calls[0][1]).toMatchObject({
    name: 'Docs',
    type: 'folder',
  })
  expect(m.post.mock.calls[1][1]).toMatchObject({ name: 'Guide', parentId: 7 })
  expect(m.put).toHaveBeenCalledWith(
    '/api/menus/9',
    expect.objectContaining({ icon: 'Home' }),
  )
  expect(m.post).toHaveBeenCalledWith('/api/menu-groups', {
    name: 'other',
    tenantId: 1,
  })
})
