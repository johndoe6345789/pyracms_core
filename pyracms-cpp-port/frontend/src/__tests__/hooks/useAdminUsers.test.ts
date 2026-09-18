import { renderHook, waitFor, act } from '@testing-library/react'
import api from '@/lib/api'
import { useAdminUsers } from '@/hooks/useAdminUsers'
import { asMockApi } from '../helpers/mockApi'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { get: jest.fn(), put: jest.fn(), delete: jest.fn() },
}))
const mock = asMockApi<'get' | 'put' | 'delete'>(api)
const data = [
  {
    id: 1, username: 'a', email: 'e',
    createdAt: '2024-01-02T03:04', banned: true,
  },
  { id: 2 },
]

async function setup() {
  mock.get.mockResolvedValue({ data })
  const h = renderHook(() => useAdminUsers())
  await waitFor(() => expect(h.result.current.loading).toBe(false))
  return h
}

beforeEach(() => {
  mock.get.mockReset()
  mock.put.mockReset().mockResolvedValue({})
  mock.delete.mockReset().mockResolvedValue({})
})

it('maps users with defaults', async () => {
  const { result } = await setup()
  expect(result.current.users[0]!.created).toBe('2024-01-02')
  expect(result.current.users[1]).toEqual({
    id: 2, username: '', email: '', created: '', banned: false,
  })
})

it('toggles ban', async () => {
  const { result } = await setup()
  act(() => result.current.handleToggleBan(99))
  expect(mock.put).not.toHaveBeenCalled()
  act(() => result.current.handleToggleBan(1))
  await waitFor(() =>
    expect(result.current.users[0]!.banned).toBe(false))
  expect(mock.put).toHaveBeenCalledWith('/api/users/1', { banned: false })
})

it('cancels and confirms delete through the API', async () => {
  const { result } = await setup()
  act(() => result.current.handleDeleteClick(result.current.users[0]!))
  expect(result.current.deleteDialogOpen).toBe(true)
  act(() => result.current.handleDeleteCancel())
  expect(result.current.selectedUser).toBeNull()
  act(() => result.current.handleDeleteConfirm())
  expect(mock.delete).not.toHaveBeenCalled()
  act(() => result.current.handleDeleteClick(result.current.users[1]!))
  act(() => result.current.handleDeleteConfirm())
  await waitFor(() => expect(result.current.users).toHaveLength(1))
  expect(mock.delete).toHaveBeenCalledWith('/api/users/2')
})

it('keeps user when delete fails; tolerates load failure', async () => {
  const { result } = await setup()
  mock.delete.mockRejectedValue(new Error('x'))
  act(() => result.current.handleDeleteClick(result.current.users[0]!))
  act(() => result.current.handleDeleteConfirm())
  await waitFor(() => expect(mock.delete).toHaveBeenCalled())
  expect(result.current.users).toHaveLength(2)
  mock.get.mockResolvedValue({ data: null })
  const h = renderHook(() => useAdminUsers())
  await waitFor(() => expect(h.result.current.loading).toBe(false))
  expect(h.result.current.users).toEqual([])
})
