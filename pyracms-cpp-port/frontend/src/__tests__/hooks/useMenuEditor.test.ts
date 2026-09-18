import { renderHook, waitFor, act } from '@testing-library/react'
import api from '@/lib/api'
import { useMenuEditor } from '@/hooks/useMenuEditor'
import { asMockApi } from '../helpers/mockApi'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(), put: jest.fn(),
    post: jest.fn(), delete: jest.fn(),
  },
}))
const mock = asMockApi<'get' | 'put' | 'post' | 'delete'>(api)

async function setup(tenant: number | null = 1) {
  const h = renderHook(() => useMenuEditor(tenant))
  await waitFor(() => expect(h.result.current.loading).toBe(false))
  return h
}

beforeEach(() => {
  mock.get.mockReset().mockImplementation((url: string) =>
    url.includes('items')
      ? Promise.resolve({ data: [{ id: 5, name: 'Home' }, { id: 6 }] })
      : Promise.resolve({ data: [{ id: 1, name: 'main' }, { id: 2 }] }))
  mock.put.mockReset().mockResolvedValue({})
  mock.delete.mockReset().mockResolvedValue({})
  mock.post.mockReset().mockResolvedValue({ data: { id: 50 } })
})

it('loads groups and selects the first', async () => {
  const { result } = await setup()
  expect(result.current.selectedGroup).toBe('main')
  expect(result.current.currentItems[0]).toEqual({
    id: 5, name: 'Home', route: '', position: 0, permissions: 'public',
  })
  expect(result.current.menuGroups[1]!.name).toBe('')
})

it('does not load without tenant, tolerates failures', async () => {
  const h = renderHook(() => useMenuEditor(null))
  expect(mock.get).not.toHaveBeenCalled()
  expect(h.result.current.currentItems).toEqual([])
  mock.get.mockReset().mockRejectedValue(new Error('x'))
  const b = await setup()
  expect(b.result.current.menuGroups).toEqual([])
})

it('survives an items failure and null data', async () => {
  mock.get.mockReset().mockImplementation((url: string) =>
    url.includes('items')
      ? Promise.reject(new Error('x'))
      : Promise.resolve({ data: [{ id: 1, name: 'g' }] }))
  const a = await setup()
  expect(a.result.current.currentItems).toEqual([])
  mock.get.mockReset().mockResolvedValue({ data: null })
  const b = await setup()
  expect(b.result.current.menuGroups).toEqual([])
})

it('edits, cancels, saves and deletes items', async () => {
  const { result } = await setup()
  act(() => result.current.handleSaveEdit())
  expect(mock.put).not.toHaveBeenCalled()
  act(() => result.current.handleStartEdit(result.current.currentItems[0]!))
  expect(result.current.editingId).toBe(5)
  act(() => result.current.handleCancelEdit())
  expect(result.current.editRow).toBeNull()
  act(() => result.current.handleStartEdit(result.current.currentItems[0]!))
  act(() => result.current.setEditRow(r => r && { ...r, name: 'New' }))
  act(() => result.current.handleSaveEdit())
  await waitFor(() => expect(result.current.editingId).toBeNull())
  expect(result.current.currentItems[0]!.name).toBe('New')
  act(() => result.current.handleDelete(6))
  await waitFor(() => expect(result.current.currentItems).toHaveLength(1))
  expect(mock.delete).toHaveBeenCalledWith('/api/menus/6')
})

it('changing group cancels edit', async () => {
  const { result } = await setup()
  act(() => result.current.handleStartEdit(result.current.currentItems[0]!))
  act(() => result.current.handleGroupChange(
    { target: { value: '' } } as never))
  expect(result.current.editingId).toBeNull()
})
