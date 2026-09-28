import { act, renderHook, waitFor } from '@testing-library/react'
import api from '@/lib/api'
import { useVideoList } from '@/hooks/useVideoList'
import { asMockApi } from '../helpers/mockApi'
import { makeVideo } from '../helpers/videoFixture'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { get: jest.fn() },
}))
const m = asMockApi<'get'>(api)
beforeEach(() => m.get.mockReset())
const page = (ids: number[], total: number) => ({
  data: { total, items: ids.map((id) => makeVideo({ id })) },
})

it('loads the first page and appends more', async () => {
  m.get
    .mockResolvedValueOnce(page([1, 2], 3))
    .mockResolvedValueOnce(page([3], 3))
  const { result } = renderHook(() => useVideoList(4, { sort: 'popular' }))
  await waitFor(() => expect(result.current.items).toHaveLength(2))
  expect(m.get.mock.calls[0]?.[0]).toBe(
    '/api/videos?tenant_id=4&sort=popular&limit=24&offset=0',
  )
  expect(result.current.hasMore).toBe(true)
  await act(() => result.current.loadMore())
  expect(m.get.mock.calls[1]?.[0]).toContain('offset=2')
  expect(result.current.items.map((v) => v.id)).toEqual([1, 2, 3])
  expect(result.current.hasMore).toBe(false)
  expect(result.current.loading).toBe(false)
})

it('empties the list on failure and tolerates odd bodies', async () => {
  m.get.mockRejectedValueOnce(new Error('x'))
  const { result } = renderHook(() => useVideoList(4, {}))
  await waitFor(() => expect(result.current.loading).toBe(false))
  expect(result.current.items).toEqual([])
  m.get.mockResolvedValueOnce({ data: null }).mockRejectedValueOnce(0)
  await act(() => result.current.loadMore())
  await act(() => result.current.loadMore())
  expect(result.current.total).toBe(0)
})

it('waits for the tenant', async () => {
  const { result } = renderHook(() => useVideoList(null, {}))
  await act(() => result.current.loadMore())
  expect(m.get).not.toHaveBeenCalled()
})

it('ignores a reply that arrives after the query changed', async () => {
  let resolve: (v: unknown) => void = () => {}
  m.get
    .mockReturnValueOnce(new Promise((r) => (resolve = r)) as never)
    .mockResolvedValueOnce(page([5], 1))
  const { result, rerender } = renderHook(({ q }) => useVideoList(4, { q }), {
    initialProps: { q: 'a' },
  })
  rerender({ q: 'b' })
  await waitFor(() => expect(result.current.items[0]?.id).toBe(5))
  await act(async () => resolve(page([9], 1)))
  expect(result.current.items[0]?.id).toBe(5)
})
