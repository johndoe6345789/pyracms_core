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

function menuApi(items: object[]) {
  m.get.mockImplementation((url: string) =>
    Promise.resolve({
      data: url.endsWith('/items') ? items : [{ id: 1, name: 'main' }],
    }),
  )
}

it('exports menu items with folders, icons and parent names', async () => {
  menuApi([
    item({ id: 1, name: 'Docs', type: 'folder', icon: 'Folder' }),
    item({ id: 2, name: 'Guide', parentId: 1 }),
  ])
  const rows = await menuSection.collect(1, noop)
  expect(rows).toEqual([
    expect.objectContaining({
      group: 'main',
      name: 'Docs',
      type: 'folder',
      parent: '',
      icon: 'Folder',
    }),
    expect.objectContaining({ name: 'Guide', parent: 'Docs', route: '/x' }),
  ])
})
