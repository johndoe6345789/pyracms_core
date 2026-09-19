import { renderHook, waitFor, act } from '@testing-library/react'
import { useMention } from '@/components/common/useMention'
import api from '@/lib/api'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { get: jest.fn() },
}))
const get = api.get as jest.Mock
beforeEach(() => get.mockReset())

describe('useMention edge cases', () => {
  it('does nothing without an element', () => {
    const { result } = renderHook(() => useMention({ current: null }))
    expect(result.current.list).toEqual([])
  })

  it('ignores events after the ref is cleared', () => {
    const el = document.createElement('input')
    const ref = { current: el as HTMLInputElement | null }
    renderHook(() => useMention(ref))
    ref.current = null
    el.dispatchEvent(new Event('input'))
    expect(get).not.toHaveBeenCalled()
  })

  it('handles empty values and missing selection', async () => {
    const el = document.createElement('textarea')
    const ref = { current: el }
    const { result } = renderHook(() => useMention(ref))
    el.dispatchEvent(new Event('keyup'))
    el.value = '@a'
    get.mockResolvedValue({ data: [{ id: 1, username: 'ann' }] })
    const sel = (value: number | null) =>
      Object.defineProperty(el, 'selectionStart', { value, configurable: true })
    sel(null)
    el.dispatchEvent(new Event('input'))
    sel(2)
    el.dispatchEvent(new Event('input'))
    await waitFor(() => expect(result.current.list).toHaveLength(1))
    act(() => result.current.clear())
    expect(result.current.list).toEqual([])
    expect(result.current.anchor).toBeNull()
  })
})
