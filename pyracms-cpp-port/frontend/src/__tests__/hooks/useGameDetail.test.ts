import { renderHook, waitFor } from '@testing-library/react'
import { useGameDetail } from '@/hooks/useGameDetail'
import { PLACEHOLDER_GAMES } from '@/hooks/data/gamePlaceholders'
import api from '@/lib/api'

jest.mock('@/lib/api', () => ({
  __esModule: true, default: { get: jest.fn() },
}))
const get = api.get as jest.Mock

describe('useGameDetail', () => {
  it('is null without a name', () => {
    const { result } = renderHook(() => useGameDetail(null, false))
    expect(result.current).toBeNull()
  })

  it('builds sample detail from placeholders', () => {
    const n = PLACEHOLDER_GAMES[0]!.name
    const { result } = renderHook(() => useGameDetail(n, true))
    expect(result.current?.name).toBe(n)
    const u = renderHook(() => useGameDetail('nope', true))
    expect(u.result.current?.displayName).toBe('nope')
  })

  it('loads live detail and tolerates errors', async () => {
    get.mockResolvedValueOnce({ data: { name: 'g', displayName: 'G' } })
    const a = renderHook(() => useGameDetail('g', false))
    await waitFor(() => expect(a.result.current?.displayName).toBe('G'))
    get.mockRejectedValueOnce(new Error('x'))
    const b = renderHook(() => useGameDetail('h', false))
    await waitFor(() => expect(get).toHaveBeenCalledTimes(2))
    expect(b.result.current).toBeNull()
  })
})
