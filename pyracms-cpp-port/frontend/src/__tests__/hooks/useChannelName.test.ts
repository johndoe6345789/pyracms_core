import { renderHook, waitFor } from '@testing-library/react'
import api from '@/lib/api'
import { useChannelName } from '@/hooks/useChannelName'
import { asMockApi } from '../helpers/mockApi'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { get: jest.fn() },
}))
const m = asMockApi<'get'>(api)

it('reads the username of the channel owner', async () => {
  m.get.mockResolvedValue({ data: { username: 'bob' } })
  const { result } = renderHook(() => useChannelName(2))
  await waitFor(() => expect(result.current).toBe('bob'))
  expect(m.get).toHaveBeenCalledWith('/api/users/2')
})

it('stays empty when hidden, odd, or unknown', async () => {
  m.get.mockReset().mockRejectedValueOnce(new Error('404'))
  const a = renderHook(() => useChannelName(2))
  await waitFor(() => expect(m.get).toHaveBeenCalled())
  expect(a.result.current).toBe('')
  m.get.mockResolvedValueOnce({ data: null })
  const b = renderHook(() => useChannelName(3))
  await waitFor(() => expect(m.get).toHaveBeenCalledTimes(2))
  expect(b.result.current).toBe('')
  renderHook(() => useChannelName(0))
  expect(m.get).toHaveBeenCalledTimes(2)
})
