import { renderHook, act, waitFor } from '@testing-library/react'
import { useMenuEditor } from '@/hooks/useMenuEditor'
import { m } from '../../helpers/scopeApi'

jest.mock('@/lib/api', () => require('../../helpers/apiMock').apiMock)

const setup = async () => {
  const h = renderHook(() => useMenuEditor(1))
  await waitFor(() => expect(h.result.current.loading).toBe(false))
  return h
}

beforeEach(() => {
  jest.resetAllMocks()
  m.get.mockImplementation((url: string) =>
    url.includes('items')
      ? Promise.resolve({ data: [{ id: 10, name: 'H', route: '/' }] })
      : Promise.resolve({ data: [{ id: 1, name: 'main' },
        { id: 2, name: 'foot' }] }))
  m.post.mockResolvedValue({ data: { id: 50 } })
  m.put.mockResolvedValue({})
  m.delete.mockResolvedValue({})
})

it('creates groups', async () => {
  const { result } = await setup()
  act(() => result.current.handleCreateGroup())
  act(() => result.current.handleOpenGroupDialog())
  expect(result.current.groupDialogOpen).toBe(true)
  act(() => result.current.setNewGroupName('main'))
  act(() => result.current.handleCreateGroup())
  expect(m.post).not.toHaveBeenCalled()
  act(() => result.current.setNewGroupName(' New Grp '))
  act(() => result.current.handleCreateGroup())
  await waitFor(() => expect(result.current.selectedGroup)
    .toBe('new_grp'))
  expect(result.current.groupDialogOpen).toBe(false)
  act(() => result.current.handleCloseGroupDialog())
})

it('tolerates api failures', async () => {
  m.post.mockRejectedValue(new Error('x'))
  m.put.mockRejectedValue(new Error('x'))
  m.delete.mockRejectedValue(new Error('x'))
  const { result } = await setup()
  act(() => {
    result.current.setNewName('N')
    result.current.setNewRoute('/n')
    result.current.setNewGroupName('g')
  })
  act(() => result.current.handleAddItem())
  act(() => result.current.handleCreateGroup())
  act(() => result.current.handleStartEdit(result.current.currentItems[0]!))
  act(() => result.current.handleSaveEdit())
  act(() => result.current.handleDelete(10))
  m.get.mockImplementation((url: string) => url.includes('items')
    ? Promise.reject(new Error('x'))
    : Promise.resolve({ data: null }))
  await setup()
  m.get.mockRejectedValue(new Error('x'))
  await setup()
})
