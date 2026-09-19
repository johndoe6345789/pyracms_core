import { renderHook, act, waitFor } from '@testing-library/react'
import api from '@/lib/api'
import { useSuperAdminUsers } from '@/hooks/useSuperAdminUsers'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { get: jest.fn(), put: jest.fn() },
}))
const mockApi = api as jest.Mocked<typeof api>

const USERS = [
  { id: 1, username: 'a', email: 'a@x', role: 1, banned: false },
  { id: 2, username: 'b', email: 'b@x', role: 1, banned: true },
]

beforeEach(() => jest.clearAllMocks())

it('reads active state from the API banned flag', async () => {
  mockApi.get.mockResolvedValueOnce({ data: USERS })
  const { result } = renderHook(() => useSuperAdminUsers())
  await waitFor(() => expect(result.current.loading).toBe(false))
  expect(result.current.users.map((u) => u.isActive)).toEqual([true, false])
})

it('rolls the toggle back when the API refuses', async () => {
  mockApi.get.mockResolvedValueOnce({ data: USERS })
  mockApi.put.mockRejectedValueOnce(new Error('403'))
  const { result } = renderHook(() => useSuperAdminUsers())
  await waitFor(() => expect(result.current.loading).toBe(false))
  await act(async () => {
    result.current.toggleBan(1)
  })
  await waitFor(() => expect(result.current.users[0]!.isActive).toBe(true))
})
