import { renderHook, act } from '@testing-library/react'
import { useThreadLive } from '@/hooks/useThreadLive'

const send = jest.fn()
let onMessage: (d: unknown) => void = () => {}
let connected = true
jest.mock('@/hooks/useWebSocket', () => ({
  useWebSocket: (o: { onMessage: (d: unknown) => void }) => {
    onMessage = o.onMessage
    return { connected, send }
  },
}))

beforeEach(() => {
  send.mockClear()
  connected = true
  jest.useFakeTimers()
})
afterEach(() => jest.useRealTimers())

it('subscribes and unsubscribes to the thread', () => {
  const { unmount } = renderHook(() => useThreadLive({ threadId: 5 }))
  expect(send).toHaveBeenCalledWith({ type: 'thread_subscribe', threadId: 5 })
  unmount()
  expect(send).toHaveBeenCalledWith({
    type: 'thread_unsubscribe',
    threadId: 5,
  })
})

it('does not subscribe when disconnected or invalid', () => {
  connected = false
  renderHook(() => useThreadLive({ threadId: 5 }))
  connected = true
  renderHook(() => useThreadLive({ threadId: 0 }))
  expect(send).not.toHaveBeenCalled()
})

it('tracks typing users and clears stale ones', () => {
  const { result } = renderHook(() => useThreadLive({ threadId: 5 }))
  act(() => onMessage({ type: 'typing_start', userId: 2 }))
  act(() => onMessage({ type: 'typing_start', userId: 2 }))
  expect(result.current.typingUsers).toHaveLength(1)
  act(() => onMessage({ type: 'typing_stop', userId: 2 }))
  expect(result.current.typingUsers).toHaveLength(0)
  act(() => onMessage({ type: 'typing_start', userId: 3 }))
  act(() => {
    jest.advanceTimersByTime(8000)
  })
  expect(result.current.typingUsers).toHaveLength(0)
})

it('reports new posts and sends typing events', () => {
  const onNewPost = jest.fn()
  const { result } = renderHook(() => useThreadLive({ threadId: 5, onNewPost }))
  act(() => onMessage({ type: 'new_post', id: 1 }))
  expect(onNewPost).toHaveBeenCalled()
  act(() => onMessage({ type: 'other' }))
  result.current.sendTypingStart()
  result.current.sendTypingStop()
  expect(send).toHaveBeenCalledWith({ type: 'typing_start', threadId: 5 })
  expect(send).toHaveBeenCalledWith({ type: 'typing_stop', threadId: 5 })
})
