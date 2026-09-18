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
const mock = asMockApi<'get' | 'post'>(api)

async function setup(tenant: number | null = 1) {
  const h = renderHook(() => useMenuEditor(tenant))
  await waitFor(() => expect(h.result.current.loading).toBe(false))
  return h
}

beforeEach(() => {
  mock.get.mockReset().mockImplementation((url: string) =>
    url.includes('items')
      ? Promise.resolve({ data: [] })
      : Promise.resolve({ data: [{ id: 1, name: 'main' }] }))
  mock.post.mockReset().mockResolvedValue({ data: { id: 50 } })
})

it('adds an item using the form state', async () => {
  const { result } = await setup()
  act(() => result.current.handleAddItem())
  expect(mock.post).not.toHaveBeenCalled()
  act(() => {
    result.current.setNewName(' Docs ')
    result.current.setNewRoute(' /docs ')
    result.current.setNewPosition('3')
    result.current.setNewPermissions('admin')
  })
  act(() => result.current.handleAddItem())
  await waitFor(() => expect(result.current.newName).toBe(''))
  expect(mock.post).toHaveBeenCalledWith('/api/menu-groups/1/items', {
    name: 'Docs', route: '/docs', position: 3, permissions: 'admin',
  })
  expect(result.current.currentItems[0]!.id).toBe(50)
  expect(result.current.newPermissions).toBe('public')
})

it('does not add without a current group', async () => {
  mock.get.mockReset().mockResolvedValue({ data: [] })
  const { result } = await setup()
  act(() => {
    result.current.setNewName('a')
    result.current.setNewRoute('/a')
  })
  act(() => result.current.handleAddItem())
  expect(mock.post).not.toHaveBeenCalled()
})

it('creates a group via the dialog', async () => {
  const { result } = await setup()
  act(() => result.current.handleOpenGroupDialog())
  expect(result.current.groupDialogOpen).toBe(true)
  act(() => result.current.handleCreateGroup())
  act(() => result.current.setNewGroupName('Main'))
  act(() => result.current.handleCreateGroup())
  expect(mock.post).not.toHaveBeenCalled()
  act(() => result.current.setNewGroupName(' Side Bar '))
  act(() => result.current.handleCreateGroup())
  await waitFor(() => expect(result.current.selectedGroup).toBe('side_bar'))
  expect(result.current.groupDialogOpen).toBe(false)
  expect(result.current.menuGroups[1]).toEqual(
    { id: 50, name: 'side_bar', items: [] },
  )
  act(() => result.current.handleOpenGroupDialog())
  act(() => result.current.handleCloseGroupDialog())
  expect(result.current.groupDialogOpen).toBe(false)
})

it('ignores group creation without tenant and on failure', async () => {
  const a = renderHook(() => useMenuEditor(null))
  act(() => a.result.current.setNewGroupName('x'))
  act(() => a.result.current.handleCreateGroup())
  expect(mock.post).not.toHaveBeenCalled()
  mock.post.mockRejectedValue(new Error('x'))
  const { result } = await setup()
  act(() => result.current.setNewGroupName('x'))
  act(() => result.current.handleCreateGroup())
  await waitFor(() => expect(mock.post).toHaveBeenCalled())
  expect(result.current.menuGroups).toHaveLength(1)
})
