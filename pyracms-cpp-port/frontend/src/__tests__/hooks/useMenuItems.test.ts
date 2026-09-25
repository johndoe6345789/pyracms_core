import { renderHook, act } from '@testing-library/react'
import { useMenuItems } from '@/hooks/admin/useMenuItems'
import { newDraft } from '@/lib/menuDraft'
import { m } from '../helpers/scopeApi'
import { menuRow } from '../helpers/menuRow'

jest.mock('@/lib/api', () => jest.requireActual('../helpers/apiMock').apiMock)

const rows = [
  menuRow({ id: 1, name: 'a', position: 1 }),
  menuRow({ id: 2, name: 'b', position: 2 }),
  menuRow({ id: 3, name: 'F', type: 'folder', position: 3, route: '' }),
]
const group = { id: 9, name: 'main', items: rows }
let setGroups: jest.Mock
const hook = () => renderHook(() => useMenuItems(group, 'main', setGroups))

beforeEach(() => {
  jest.resetAllMocks()
  setGroups = jest.fn()
  m.post.mockResolvedValue({ data: { id: 77 } })
  m.put.mockResolvedValue({})
  m.delete.mockResolvedValue({})
})

it('adds a link last in its folder and a folder without a link', async () => {
  const { result } = hook()
  let ok = false
  await act(async () => {
    ok = await result.current.save({
      ...newDraft('route', 3),
      name: ' New ',
      route: '/x',
    })
  })
  expect(ok).toBe(true)
  expect(m.post).toHaveBeenCalledWith('/api/menu-groups/9/items', {
    name: 'New',
    routePath: '/x',
    url: '',
    type: 'route',
    position: 1,
    permissions: 'public',
    parentId: 3,
  })
  await act(async () => {
    await result.current.save({ ...newDraft('folder'), name: 'Dir' })
  })
  expect(m.post).toHaveBeenLastCalledWith(
    '/api/menu-groups/9/items',
    expect.objectContaining({ type: 'folder', parentId: 0, position: 4 }),
  )
})

it('refuses an empty name or a bad route without calling the server', async () => {
  const { result } = hook()
  let ok = true
  await act(async () => {
    ok = await result.current.save({ ...newDraft(), name: '', route: '/x' })
  })
  await act(async () => {
    ok =
      ok ||
      (await result.current.save({ ...newDraft(), name: 'n', route: 'no' }))
  })
  expect(ok).toBe(false)
  expect(m.post).not.toHaveBeenCalled()
})

it('edits an item, keeping its place unless it changes folder', async () => {
  const { result } = hook()
  await act(async () => {
    await result.current.save({ ...newDraft(), name: 'a2', route: '/a' }, 1)
  })
  expect(m.put).toHaveBeenLastCalledWith(
    '/api/menus/1',
    expect.objectContaining({ name: 'a2', position: 1, parentId: 0 }),
  )
  await act(async () => {
    await result.current.save(
      { ...newDraft('route', 3), name: 'a', route: '/a' },
      1,
    )
  })
  expect(m.put).toHaveBeenLastCalledWith(
    '/api/menus/1',
    expect.objectContaining({ parentId: 3, position: 1 }),
  )
})

it('moves an item by renumbering its level, and stops at the ends', async () => {
  const { result } = hook()
  await act(() => result.current.move(2, -1))
  expect(m.put).toHaveBeenCalledWith('/api/menus/2', { position: 1 })
  expect(m.put).toHaveBeenCalledWith('/api/menus/1', { position: 2 })
  m.put.mockClear()
  await act(() => result.current.move(1, -1)) // already first
  await act(() => result.current.move(99, 1)) // unknown
  expect(m.put).not.toHaveBeenCalled()
})

it('deletes, and reports failures', async () => {
  const { result } = hook()
  await act(() => result.current.remove(2))
  expect(m.delete).toHaveBeenCalledWith('/api/menus/2')
  expect(setGroups).toHaveBeenCalled()
  m.delete.mockRejectedValue({ response: { data: { error: 'no' } } })
  await act(() => result.current.remove(2))
  expect(result.current.error).toBe('no')
})
