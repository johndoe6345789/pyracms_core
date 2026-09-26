import { draftInvalid, newDraft, permissionLabel } from '@/lib/menuDraft'
import { fieldsOf, reordered, siblingsOf } from '@/lib/menuOrder'
import { menuRow } from '../helpers/menuRow'

it('a link needs a name and a good route; a folder only a name', () => {
  expect(draftInvalid({ ...newDraft(), name: '', route: '/x' })).toBe(true)
  expect(draftInvalid({ ...newDraft(), name: 'n', route: '' })).toBe(true)
  expect(draftInvalid({ ...newDraft(), name: 'n', route: 'no' })).toBe(true)
  expect(draftInvalid({ ...newDraft(), name: 'n', route: '/x' })).toBe(false)
  expect(draftInvalid({ ...newDraft('folder'), name: 'F' })).toBe(false)
})

it('names permissions, falling back to the raw value', () => {
  expect(permissionLabel('admin')).toBe('Admins only')
  expect(permissionLabel('odd')).toBe('odd')
})

const rows = [
  menuRow({ id: 1, position: 2 }),
  menuRow({ id: 2, position: 1 }),
  menuRow({ id: 3, position: 5, parentId: 9 }),
]

it('lists a level in order and puts new items last', () => {
  expect(siblingsOf(rows, 0).map((r) => r.id)).toEqual([2, 1])
  expect(
    fieldsOf({ ...newDraft(), name: ' n ', route: '/x' }, undefined, rows),
  ).toMatchObject({ name: 'n', position: 3 })
  expect(
    fieldsOf(
      { ...newDraft('folder'), name: 'F', parentId: 4 },
      undefined,
      rows,
    ),
  ).toMatchObject({ route: '', parentId: 0 })
})

it('renumbers a level only where it changed, and refuses edge moves', () => {
  expect(reordered(rows, 1, -1)?.map((r) => [r.id, r.position])).toEqual([
    [1, 1],
    [2, 2],
  ])
  expect(reordered(rows, 2, -1)).toBeNull()
  expect(reordered(rows, 99, 1)).toBeNull()
})
