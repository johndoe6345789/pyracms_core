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
let ensure: jest.Mock
const hook = () => renderHook(() => useMenuItems(group, setGroups, ensure))

beforeEach(() => {
  jest.resetAllMocks()
  setGroups = jest.fn()
  ensure = jest.fn()
  m.post.mockResolvedValue({ data: { id: 77 } })
  m.put.mockResolvedValue({})
  m.delete.mockResolvedValue({})
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

it('makes the menu itself when the site has none yet', async () => {
  ensure.mockResolvedValue({ id: 4, name: 'main', items: [] })
  const { result } = renderHook(() =>
    useMenuItems(undefined, setGroups, ensure),
  )
  await act(async () => {
    await result.current.save({ ...newDraft(), name: 'First', route: '/' })
  })
  expect(ensure).toHaveBeenCalled()
  expect(m.post).toHaveBeenCalledWith(
    '/api/menu-groups/4/items',
    expect.objectContaining({ name: 'First', position: 1 }),
  )
})
