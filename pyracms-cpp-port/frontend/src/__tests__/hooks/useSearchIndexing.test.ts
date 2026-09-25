import { renderHook, act, waitFor } from '@testing-library/react'
import api from '@/lib/api'
import { useSearchIndexing } from '@/hooks/admin/useSearchIndexing'
import { asMockApi } from '../helpers/mockApi'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn() },
}))
const m = asMockApi<'get' | 'post'>(api)
const status = {
  engine: 'elasticsearch',
  configured: true,
  reachable: true,
  source: { article: 3 },
  indexed: { article: 3 },
  pending: 0,
}

beforeEach(() => {
  m.get.mockReset().mockResolvedValue({ data: status })
  m.post.mockReset()
})

it('loads the status for the site', async () => {
  const { result } = renderHook(() => useSearchIndexing(4))
  await waitFor(() => expect(result.current.loading).toBe(false))
  expect(m.get).toHaveBeenCalledWith('/api/admin/search?tenant_id=4')
  expect(result.current.status.source).toEqual({ article: 3 })
})

it('waits for a tenant and reports a failed load', async () => {
  renderHook(() => useSearchIndexing(null))
  expect(m.get).not.toHaveBeenCalled()
  m.get.mockRejectedValue({ response: { data: { error: 'Nope' } } })
  const { result } = renderHook(() => useSearchIndexing(4))
  await waitFor(() => expect(result.current.error).toBe('Nope'))
})

it('starts a reindex and shows how much was queued', async () => {
  m.post.mockResolvedValue({ data: { queued: 12 } })
  const { result } = renderHook(() => useSearchIndexing(4))
  await waitFor(() => expect(result.current.loading).toBe(false))
  await act(() => result.current.reindex())
  expect(m.post).toHaveBeenCalledWith(
    '/api/admin/search/reindex?tenant_id=4',
    {},
  )
  expect(result.current.queued).toBe(12)
})

it('reports a reindex that could not start', async () => {
  m.post.mockRejectedValue({ response: { data: { error: 'No cluster' } } })
  const { result } = renderHook(() => useSearchIndexing(4))
  await waitFor(() => expect(result.current.loading).toBe(false))
  await act(() => result.current.reindex())
  expect(result.current.error).toBe('No cluster')
})

it('keeps polling while changes are queued', async () => {
  jest.useFakeTimers()
  m.get.mockResolvedValue({ data: { ...status, pending: 5 } })
  renderHook(() => useSearchIndexing(4))
  await act(async () => {
    await jest.advanceTimersByTimeAsync(0) // first load lands
  })
  await act(async () => {
    await jest.advanceTimersByTimeAsync(3100)
  })
  expect(m.get.mock.calls.length).toBeGreaterThan(1)
  jest.useRealTimers()
})
