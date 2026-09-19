import { renderHook, act } from '@testing-library/react'
import { useGameDepList, type GameDepItem } from '@/hooks/useGameDepList'
import { useGameDepDetail } from '@/hooks/useGameDepDetail'
import { DEP_DETAIL } from '../helpers/depDetailFixture'

const mk = (n: string, l: number, v: number, d: string, t: string[]) =>
  ({
    name: n,
    displayName: n,
    description: `about ${n}`,
    tags: t,
    likes: l,
    dislikes: 0,
    views: v,
    created: d,
  }) as GameDepItem
const items = [
  mk('a', 1, 9, '2024-01-01', ['x']),
  mk('b', 5, 1, '2024-03-01', ['y']),
]

describe('useGameDepList', () => {
  it('sorts by votes, views and date', () => {
    const { result } = renderHook(() => useGameDepList(items, ['x']))
    expect(result.current.filtered[0]!.name).toBe('b')
    act(() => result.current.setSortBy('views'))
    expect(result.current.filtered[0]!.name).toBe('a')
    act(() => result.current.setSortBy('date'))
    expect(result.current.filtered[0]!.name).toBe('b')
    act(() => result.current.setSortBy('none'))
    expect(result.current.filtered).toHaveLength(2)
  })

  it('filters by search text and tag', () => {
    const { result } = renderHook(() => useGameDepList(items, ['x']))
    act(() => result.current.setSearch('ABOUT a'))
    expect(result.current.filtered.map((i) => i.name)).toEqual(['a'])
    act(() => {
      result.current.setSearch('')
      result.current.setFilterTag('y')
    })
    expect(result.current.filtered.map((i) => i.name)).toEqual(['b'])
  })
})

describe('useGameDepDetail', () => {
  it('tracks the tab', () => {
    const { result } = renderHook(() => useGameDepDetail(DEP_DETAIL))
    act(() => result.current.setTabIndex(2))
    expect(result.current.tabIndex).toBe(2)
  })
})
