import { renderHook, act, waitFor } from '@testing-library/react'
import { useAdminUsers } from '@/hooks/useAdminUsers'
import { m } from '../../helpers/scopeApi'

jest.mock(
  '@/lib/api',
  () => jest.requireActual('../../helpers/apiMock').apiMock,
)

beforeEach(() => {
  jest.resetAllMocks()
  m.get.mockResolvedValue({
    data: [{ id: 1, username: 'u', createdAt: '2024-01-02T03:04' }, { id: 2 }],
  })
  m.put.mockResolvedValue({})
  m.delete.mockResolvedValue({})
})

it('maps, bans, deletes', async () => {
  const { result } = renderHook(() => useAdminUsers())
  await waitFor(() => expect(result.current.loading).toBe(false))
  expect(result.current.users[0]!.created).toBe('2024-01-02')
  expect(result.current.users[1]!.username).toBe('')
  act(() => result.current.handleToggleBan(99))
  act(() => result.current.handleToggleBan(1))
  await waitFor(() => expect(result.current.users[0]!.banned).toBe(true))
  act(() => result.current.handleDeleteClick(result.current.users[0]!))
  expect(result.current.deleteDialogOpen).toBe(true)
  act(() => result.current.handleDeleteCancel())
  expect(result.current.selectedUser).toBeNull()
  act(() => result.current.handleDeleteConfirm())
  act(() => result.current.handleDeleteClick(result.current.users[0]!))
  act(() => result.current.handleDeleteConfirm())
  await waitFor(() => expect(result.current.users).toHaveLength(1))
})

it('handles null data and errors', async () => {
  m.get.mockResolvedValue({ data: null })
  const a = renderHook(() => useAdminUsers())
  await waitFor(() => expect(a.result.current.loading).toBe(false))
  m.get.mockRejectedValue(new Error('x'))
  const b = renderHook(() => useAdminUsers())
  await waitFor(() => expect(b.result.current.loading).toBe(false))
  expect(b.result.current.users).toEqual([])
})
