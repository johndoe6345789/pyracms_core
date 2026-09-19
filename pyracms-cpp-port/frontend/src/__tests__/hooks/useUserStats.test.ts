import { renderHook, waitFor } from '@testing-library/react'
import api from '@/lib/api'
import { useUserStats, clearUserStatsCache } from '@/hooks/useUserStats'
import { asMockApi } from '../helpers/mockApi'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { get: jest.fn() },
}))
const m = asMockApi<'get'>(api)
beforeEach(() => {
  m.get.mockReset()
  clearUserStatsCache()
})

it('fetches stats once per author', async () => {
  m.get.mockResolvedValue({
    data: {
      postCount: 4,
      threadCount: 1,
      joinedAt: '2020-01-02T03:04',
      reputation: 9,
    },
  })
  const a = renderHook(() => useUserStats(5, 2))
  const b = renderHook(() => useUserStats(5, 2))
  await waitFor(() => expect(a.result.current?.postCount).toBe(4))
  await waitFor(() => expect(b.result.current?.reputation).toBe(9))
  expect(m.get).toHaveBeenCalledTimes(1)
  expect(m.get).toHaveBeenCalledWith('/api/forum/users/5/stats?tenant_id=2')
})

it('stays null on failure and without ids', async () => {
  m.get.mockRejectedValue(new Error('x'))
  const a = renderHook(() => useUserStats(5, 2))
  const b = renderHook(() => useUserStats(undefined, 2))
  await waitFor(() => expect(m.get).toHaveBeenCalled())
  expect(a.result.current).toBeNull()
  expect(b.result.current).toBeNull()
  expect(m.get).toHaveBeenCalledTimes(1)
})
