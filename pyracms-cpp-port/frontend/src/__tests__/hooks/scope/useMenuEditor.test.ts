import { renderHook, act, waitFor } from '@testing-library/react'
import { useMenuEditor } from '@/hooks/useMenuEditor'
import { m } from '../../helpers/scopeApi'

jest.mock(
  '@/lib/api',
  () => jest.requireActual('../../helpers/apiMock').apiMock,
)

beforeEach(() => {
  jest.resetAllMocks()
  m.get.mockImplementation((url: string) =>
    url.includes('items')
      ? Promise.resolve({ data: [{ id: 10, name: 'H', route: '/' }] })
      : Promise.resolve({
          data: [
            { id: 1, name: 'main' },
            { id: 2, name: 'foot' },
          ],
        }),
  )
  m.post.mockResolvedValue({ data: { id: 50 } })
  m.put.mockResolvedValue({})
  m.delete.mockResolvedValue({})
})

const setup = async () => {
  const h = renderHook(() => useMenuEditor(1))
  await waitFor(() => expect(h.result.current.loading).toBe(false))
  return h
}

it('loads groups and switches', async () => {
  const { result } = await setup()
  expect(result.current.selectedGroup).toBe('main')
  expect(result.current.currentItems[0]).toMatchObject({
    position: 0,
    permissions: 'public',
  })
  act(() => result.current.handleStartEdit(result.current.currentItems[0]!))
  act(() =>
    result.current.handleGroupChange({ target: { value: 'foot' } } as never),
  )
  expect(result.current.selectedGroup).toBe('foot')
  expect(result.current.editingId).toBeNull()
})

it('edits and deletes items', async () => {
  const { result } = await setup()
  act(() => result.current.handleSaveEdit())
  act(() => result.current.handleStartEdit(result.current.currentItems[0]!))
  act(() =>
    result.current.setEditRow({ ...result.current.editRow!, name: 'Z' }),
  )
  act(() => result.current.handleSaveEdit())
  await waitFor(() => expect(result.current.currentItems[0]!.name).toBe('Z'))
  act(() => result.current.handleDelete(10))
  await waitFor(() => expect(result.current.currentItems).toHaveLength(0))
})

it('adds items', async () => {
  const { result } = await setup()
  act(() => result.current.handleAddItem())
  act(() => {
    result.current.setNewName('N')
    result.current.setNewRoute('/n')
    result.current.setNewPosition('3')
    result.current.setNewPermissions('admin')
  })
  act(() => result.current.handleAddItem())
  await waitFor(() => expect(result.current.currentItems).toHaveLength(2))
  expect(result.current.currentItems[1]).toMatchObject({
    id: 50,
    position: 3,
    permissions: 'admin',
  })
})
