import { renderHook, act, waitFor, fireEvent } from '@testing-library/react'
import { useGlobalSearch } from '@/components/common/search/useGlobalSearch'
import { fetchSuggestions } from '@/lib/search/api'

jest.mock('next/navigation', () => ({ usePathname: () => '/site/rog/x' }))
let tenant: number | null = 6
jest.mock('@/hooks/useTenantId', () => ({
  useTenantId: () => ({ tenantId: tenant }),
}))
jest.mock('@/lib/search/api')
const fetchMock = fetchSuggestions as jest.Mock

beforeEach(() => {
  jest.resetAllMocks()
  tenant = 6
})

it('opens with Ctrl+K, closes with Escape and forgets the query', () => {
  const { result } = renderHook(() => useGlobalSearch())
  fireEvent.keyDown(document, { key: 'k', ctrlKey: true })
  expect(result.current.open).toBe(true)
  act(() => result.current.setQ('golf'))
  fireEvent.keyDown(document, { key: 'Escape' })
  expect(result.current.open).toBe(false)
  expect(result.current.q).toBe('')
})

it('asks for suggestions once typing settles', async () => {
  jest.useFakeTimers()
  fetchMock.mockResolvedValue([{ title: 'A' }])
  const { result } = renderHook(() => useGlobalSearch())
  act(() => result.current.setQ('g'))
  act(() => result.current.setQ('golf'))
  act(() => {
    jest.advanceTimersByTime(100)
  })
  expect(fetchMock).not.toHaveBeenCalled()
  act(() => {
    jest.advanceTimersByTime(300)
  })
  jest.useRealTimers()
  await waitFor(() => expect(result.current.res).toHaveLength(1))
  expect(fetchMock).toHaveBeenCalledTimes(1)
  expect(fetchMock).toHaveBeenCalledWith('rog', 6, 'golf')
  expect(result.current.slug).toBe('rog')
})

it('a failing lookup leaves no suggestions; no site, no lookup', async () => {
  jest.useFakeTimers()
  fetchMock.mockRejectedValue(new Error('x'))
  const { result, rerender } = renderHook(() => useGlobalSearch())
  act(() => result.current.setQ('golf'))
  act(() => {
    jest.advanceTimersByTime(400)
  })
  jest.useRealTimers()
  await waitFor(() => expect(result.current.loading).toBe(false))
  expect(result.current.res).toEqual([])
  tenant = null
  fetchMock.mockClear()
  rerender()
  act(() => result.current.setQ('fish'))
  expect(fetchMock).not.toHaveBeenCalled()
})
