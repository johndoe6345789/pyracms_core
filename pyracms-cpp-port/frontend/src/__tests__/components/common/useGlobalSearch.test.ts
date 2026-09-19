import { renderHook, act, waitFor } from '@testing-library/react'
import { fireEvent } from '@testing-library/react'
import { useGlobalSearch }
  from '@/components/common/search/useGlobalSearch'
import api from '@/lib/api'

jest.mock('@/lib/api', () => ({
  __esModule: true, default: { get: jest.fn() },
}))
const get = api.get as jest.Mock
beforeEach(() => get.mockReset())

describe('useGlobalSearch', () => {
  it('opens with Ctrl+K and closes with Escape', () => {
    const { result } = renderHook(() => useGlobalSearch())
    fireEvent.keyDown(document, { key: 'k', ctrlKey: true })
    expect(result.current.open).toBe(true)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(result.current.open).toBe(false)
  })

  it('debounces, maps results and fills defaults', async () => {
    jest.useFakeTimers()
    get.mockResolvedValue({ data: { items: [{ id: 1, title: 'A' }, {}] } })
    const { result } = renderHook(() => useGlobalSearch())
    act(() => result.current.setQ('a'))
    act(() => { jest.advanceTimersByTime(400) })
    expect(get).not.toHaveBeenCalled()
    act(() => result.current.setQ('ab'))
    act(() => { jest.advanceTimersByTime(400) })
    jest.useRealTimers()
    await waitFor(() => expect(result.current.res).toHaveLength(2))
    expect(result.current.res[1]).toMatchObject(
      { type: 'article', url: '#', title: '' })
    expect(get.mock.calls[0][0]).toBe('/api/search/autocomplete?q=ab')
  })

  it('adds a tenant on site pages and accepts array payloads', async () => {
    window.history.pushState({}, '', '/site/demo/x')
    get.mockResolvedValue({ data: [{ id: 3, type: 'user' }] })
    const { result } = renderHook(() => useGlobalSearch())
    act(() => result.current.setQ('zz'))
    await waitFor(() => expect(result.current.res).toHaveLength(1))
    expect(get.mock.calls[0][0]).toContain('&tenant_id=1')
    window.history.pushState({}, '', '/')
  })

  it('clears results on error and when closed', async () => {
    get.mockRejectedValue(new Error('x'))
    const { result } = renderHook(() => useGlobalSearch())
    act(() => { result.current.setOpen(true); result.current.setQ('qq') })
    await waitFor(() => expect(get).toHaveBeenCalled())
    expect(result.current.res).toEqual([])
    act(() => result.current.setOpen(false))
    expect(result.current.q).toBe('')
  })
})
