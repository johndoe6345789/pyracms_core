import { renderHook } from '@testing-library/react'
import { useForumUser } from '@/hooks/useForumUser'

let mockState: unknown
jest.mock('react-redux', () => ({
  useSelector: (fn: (s: unknown) => unknown) => fn(mockState),
}))

const state = (user: unknown, isAuthenticated: boolean) => ({
  auth: { user, isAuthenticated },
})

describe('useForumUser', () => {
  it('handles a signed-out visitor', () => {
    mockState = state(null, false)
    const { result } = renderHook(() => useForumUser())
    expect(result.current).toEqual({
      userId: null,
      isAuthenticated: false,
      isModerator: false,
    })
  })
  it('flags moderators by role', () => {
    mockState = state({ id: 4, role: 2 }, true)
    const { result } = renderHook(() => useForumUser())
    expect(result.current.userId).toBe(4)
    expect(result.current.isModerator).toBe(true)
  })
  it('flags admins as moderators', () => {
    mockState = state({ id: 5, role: 0, isAdmin: true }, true)
    const { result } = renderHook(() => useForumUser())
    expect(result.current.isModerator).toBe(true)
  })
  it('does not flag regular users', () => {
    mockState = state({ id: 6, role: 1 }, true)
    const { result } = renderHook(() => useForumUser())
    expect(result.current.isModerator).toBe(false)
  })
})
