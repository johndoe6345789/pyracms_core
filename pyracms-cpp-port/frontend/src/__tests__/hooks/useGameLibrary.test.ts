import { renderHook, act, waitFor } from '@testing-library/react'
import {
  useGameLibrary, filterGames, mapListItem, mapDetail,
} from '@/hooks/useGameLibrary'
import api from '@/lib/api'

jest.mock('@/lib/api', () => ({
  __esModule: true, default: { get: jest.fn() },
}))
const get = api.get as jest.Mock

const rows = [
  { name: 'b', displayName: 'Bee', description: 'buzz', tags: ['x'] },
  { name: 'a', description: 'alpha', tags: ['y'], viewCount: 3 },
]

beforeEach(() => { localStorage.clear(); get.mockReset() })

describe('mappers', () => {
  it('maps list items with defaults', () => {
    const m = mapListItem({ name: 'n', createdAt: '2024-01-02T03' })
    expect(m).toMatchObject(
      { displayName: 'n', tags: [], created: '2024-01-02' })
  })
  it('maps detail with revisions and owner', () => {
    const d = mapDetail({ name: 'n', ownerId: 4, revisions: [
      { version: '1', published: true, createdAt: '2024-05-05T1' }] })
    expect(d.owner).toBe('user #4')
    expect(d.revisions[0]).toEqual(
      { version: '1', published: true, date: '2024-05-05' })
    expect(mapDetail({ name: 'n' }).owner).toBe('Unknown')
  })
})

describe('filterGames', () => {
  const g = rows.map((r) => mapListItem(r))
  it('filters by search, tag and marks, sorted', () => {
    expect(filterGames(g, '', '', 'all', {}, {}).map((x) => x.name))
      .toEqual(['a', 'b'])
    expect(filterGames(g, 'buzz', '', 'all', {}, {})).toHaveLength(1)
    expect(filterGames(g, '', 'y', 'all', {}, {})).toHaveLength(1)
    const f = (k: 'installed' | 'favourites', i = {}, v = {}) =>
      filterGames(g, '', '', k, i, v)
    expect(f('installed', { a: '1' })).toHaveLength(1)
    expect(f('favourites', {}, { b: '1' })).toHaveLength(1)
  })
})

describe('useGameLibrary', () => {
  it('loads games from the api', async () => {
    get.mockResolvedValue({ data: rows })
    const { result } = renderHook(() => useGameLibrary())
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
    const a = renderHook(() => useGameLibrary())
    await waitFor(() => expect(a.result.current.loading).toBe(false))
    expect(a.result.current.games).toEqual([])
    get.mockRejectedValue(new Error('x'))
    const b = renderHook(() => useGameLibrary())
    await waitFor(() => expect(b.result.current.loading).toBe(false))
    expect(b.result.current.games).toEqual([])
  })
})
