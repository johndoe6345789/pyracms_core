import { renderHook, waitFor } from '@testing-library/react'
import { useGameDetail } from '@/hooks/useGameDetail'
import api from '@/lib/api'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { get: jest.fn() },
}))
const get = api.get as jest.Mock

describe('useGameDetail', () => {
  it('is null without a name', () => {
    const { result } = renderHook(() => useGameDetail(null))
    expect(result.current).toBeNull()
  })

  it('loads live detail and tolerates errors', async () => {
    get.mockResolvedValueOnce({ data: { name: 'g', displayName: 'G' } })
    const a = renderHook(() => useGameDetail('g'))
    await waitFor(() => expect(a.result.current?.displayName).toBe('G'))
    get.mockRejectedValueOnce(new Error('x'))
    const b = renderHook(() => useGameDetail('h'))
    await waitFor(() => expect(get).toHaveBeenCalledTimes(2))
    expect(b.result.current).toBeNull()
  })
})
