import { renderHook, act } from '@testing-library/react'
import { type GameDepItem } from '@/hooks/useGameDepList'
import { useGameDepEditor } from '@/hooks/useGameDepEditor'

const mk = (n: string, l: number, v: number, d: string, t: string[]) =>
  ({ name: n, displayName: n, description: `about ${n}`, tags: t,
    likes: l, dislikes: 0, views: v, created: d }) as GameDepItem

describe('useGameDepEditor', () => {
  it('adds normalized unique tags and deletes', () => {
    const { result } = renderHook(
      () => useGameDepEditor('N', 'D', ['a'], []))
    act(() => result.current.setTagInput('  A '))
    act(() => result.current.handleAddTag())
    expect(result.current.tags).toEqual(['a'])
    act(() => result.current.setTagInput('New'))
    act(() => result.current.handleAddTag())
    expect(result.current.tags).toEqual(['a', 'new'])
    expect(result.current.tagInput).toBe('')
    act(() => result.current.handleDeleteTag('a'))
    expect(result.current.tags).toEqual(['new'])
  })

  it('updates simple fields', () => {
    const { result } = renderHook(
      () => useGameDepEditor('N', 'D', [], []))
    act(() => {
      result.current.setDisplayName('X')
      result.current.setDescription('Y')
      result.current.setSelectedOs('Linux')
      result.current.setSelectedArch('arm64')
    })
    expect(result.current).toMatchObject({ displayName: 'X',
      description: 'Y', selectedOs: 'Linux', selectedArch: 'arm64' })
  })
})
