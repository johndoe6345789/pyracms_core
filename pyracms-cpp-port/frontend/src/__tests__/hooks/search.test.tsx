import { renderHook, act, waitFor } from '@testing-library/react'
import { useSearchPage } from '@/hooks/useSearchPage'
import { fetchSearch } from '@/hooks/searchTypes'
import { formatDay, formatDateTime, parseApiDate }
  from '@/hooks/articleDate'
import api from '@/lib/api'

const push = jest.fn()
let qs = 'q=hello&site=demo'
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
  useSearchParams: () => new URLSearchParams(qs),
}))
jest.mock('@/hooks/useTenantId', () => ({
  useTenantId: () => ({ tenantId: 7 }),
}))
jest.mock('@/lib/api', () => ({
  __esModule: true, default: { get: jest.fn() },
}))
const get = api.get as jest.Mock
const payload = { data: { items: [{ id: 1 }], totalCount: 11,
  facets: { article: 11 } } }
beforeEach(() => {
  get.mockReset(); push.mockReset(); qs = 'q=hello&site=demo'
})

describe('fetchSearch', () => {
  it('builds params and defaults missing fields', async () => {
    get.mockResolvedValue({ data: {} })
    const r = await fetchSearch('a b', '3', 'all', 2)
    expect(r).toEqual({ items: [], totalCount: 0, facets: {} })
    expect(get.mock.calls[0][0]).toContain('offset=10')
    expect(get.mock.calls[0][0]).toContain('tenant_id=3')
  })
})

describe('useSearchPage', () => {
  it('searches the initial query with the site tenant', async () => {
    get.mockResolvedValue(payload)
    const { result } = renderHook(() => useSearchPage())
    await waitFor(() => expect(result.current.totalCount).toBe(11))
    expect(get.mock.calls[0][0]).toContain('tenant_id=7')
    expect(result.current.facets).toEqual({ article: 11 })
  })

  it('handles searches, type changes and pushes the url', async () => {
    qs = 'tenant_id=9'
    get.mockResolvedValue(payload)
    const { result } = renderHook(() => useSearchPage())
    await act(async () => { result.current.handleSearch('foo') })
    expect(push).toHaveBeenCalledWith('/search?tenant_id=9&q=foo')
    await act(async () => { result.current.handleTypeChange('snippet') })
    expect(result.current.activeType).toBe('snippet')
    expect(get.mock.calls.at(-1)![0]).toContain('type=snippet')
  })

  it('clears state for empty queries and errors', async () => {
    qs = ''
    const { result } = renderHook(() => useSearchPage())
    await act(async () => { result.current.handleSearch('') })
    expect(result.current.results).toEqual([])
    get.mockRejectedValue(new Error('x'))
    await act(async () => { result.current.handleSearch('boom') })
    expect(result.current.results).toEqual([])
    expect(result.current.loading).toBe(false)
  })
})

describe('article dates', () => {
  it('parses API timestamps', () => {
    expect(parseApiDate('2024-03-05 10:20:30+00').toISOString())
      .toBe('2024-03-05T10:20:30.000Z')
  })

  it('formats days and date-times', () => {
    expect(formatDay('')).toBe('')
    expect(formatDay('2024-03-05 10:20:30+00')).toContain('2024')
    expect(formatDateTime('2024-03-05 10:20:30+00')).toContain('2024')
  })
})
