import { renderHook, act, waitFor } from '@testing-library/react'
import { useGameLibrary } from '@/hooks/useGameLibrary'
import api from '@/lib/api'

jest.mock('@/hooks/useTenantId', () => ({
  useTenantId: () => ({ tenantId: 7, loading: false }),
}))
jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { get: jest.fn() },
}))

const get = api.get as jest.Mock

const rows = [
  { name: 'b', displayName: 'Bee', description: 'buzz', tags: ['x'] },
  { name: 'a', description: 'alpha', tags: ['y'], viewCount: 3 },
]

beforeEach(() => {
  localStorage.clear()
  get.mockReset()
})

describe('useGameLibrary', () => {
  it('loads games from the api', async () => {
    get.mockResolvedValue({ data: rows })
    const { result } = renderHook(() => useGameLibrary('s'))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.tags).toEqual(['x', 'y'])
    act(() => result.current.markInstalled('a', '1'))
    expect(result.current.installed).toEqual({ a: '1' })
    act(() => result.current.unmark('a'))
    expect(result.current.installed).toEqual({})
    act(() => result.current.toggleFav('a'))
    expect(result.current.favs).toEqual({ a: '1' })
    act(() => result.current.setSearch('bee'))
    expect(result.current.visible).toHaveLength(1)
  })

  it('is empty (no fake games) when the api is empty or failing', async () => {
    get.mockResolvedValue({ data: [] })
    const a = renderHook(() => useGameLibrary('s'))
    await waitFor(() => expect(a.result.current.loading).toBe(false))
    expect(a.result.current.games).toEqual([])
    get.mockRejectedValue(new Error('x'))
    const b = renderHook(() => useGameLibrary('s'))
    await waitFor(() => expect(b.result.current.loading).toBe(false))
    expect(b.result.current.games).toEqual([])
  })
})
