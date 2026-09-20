import { renderHook, act } from '@testing-library/react'
import { useAutoSave } from '@/components/articles/useAutoSave'

const key = (k: string) => `autosave-${k}`

beforeEach(() => {
  localStorage.clear()
  jest.useFakeTimers()
})
afterEach(() => jest.useRealTimers())

describe('useAutoSave drafts', () => {
  it('keeps the draft under its own key after a pause', () => {
    const { rerender } = renderHook(
      ({ v }) => useAutoSave(v, jest.fn(), 'new:demo'),
      { initialProps: { v: '' } },
    )
    rerender({ v: 'hello' })
    act(() => void jest.advanceTimersByTime(1000))
    expect(localStorage.getItem(key('new:demo'))).toBe('hello')
    expect(localStorage.getItem(key('article-editor'))).toBeNull()
  })

  it('puts a draft back into an empty editor and offers to discard', () => {
    localStorage.setItem(key('new:demo'), 'saved text')
    const onChange = jest.fn()
    const { result } = renderHook(() => useAutoSave('', onChange, 'new:demo'))
    expect(onChange).toHaveBeenCalledWith('saved text')
    expect(result.current.restored).toBe(true)
    act(() => result.current.discard())
    expect(result.current.restored).toBe(false)
    expect(localStorage.getItem(key('new:demo'))).toBeNull()
    expect(onChange).toHaveBeenLastCalledWith('')
  })

  it('never restores another key, or over existing text', () => {
    localStorage.setItem(key('new:other'), 'not mine')
    localStorage.setItem(key('new:demo'), 'draft')
    const a = jest.fn()
    renderHook(() => useAutoSave('', a, 'new:demo2'))
    const b = jest.fn()
    renderHook(() => useAutoSave('already typed', b, 'new:demo'))
    expect(a).not.toHaveBeenCalled()
    expect(b).not.toHaveBeenCalled()
  })
})
