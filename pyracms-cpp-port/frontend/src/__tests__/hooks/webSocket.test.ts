import { renderHook, act } from '@testing-library/react'
import { useWebSocket } from '@/hooks/useWebSocket'
import { currentToken } from '@/lib/session'
import { FakeWs } from '../helpers/fakeWebSocket'

jest.mock('@/lib/session', () => ({ currentToken: jest.fn() }))
const token = currentToken as jest.Mock

beforeEach(() => {
  FakeWs.all = []
  ;(global as unknown as { WebSocket: unknown }).WebSocket = FakeWs
  token.mockReturnValue('tok')
})

describe('useWebSocket', () => {
  it('connects with the token, relays messages and sends', () => {
    const onMessage = jest.fn()
    const onConnect = jest.fn()
    const { result } = renderHook(() =>
      useWebSocket({ url: 'http://h/ws?a=1', onMessage, onConnect }),
    )
    const ws = FakeWs.all[0]!
    expect(ws.url).toBe('ws://h/ws?a=1&token=tok')
    act(() => ws.onopen())
    expect(result.current.connected).toBe(true)
    act(() => ws.onmessage({ data: '{"a":1}' }))
    act(() => ws.onmessage({ data: 'plain' }))
    expect(onMessage).toHaveBeenNthCalledWith(1, { a: 1 })
    expect(onMessage).toHaveBeenNthCalledWith(2, 'plain')
    act(() => result.current.send({ x: 1 }))
    act(() => result.current.send('raw'))
    expect(ws.sent).toEqual(['{"x":1}', 'raw'])
  })

  it('does nothing without a token', () => {
    token.mockReturnValue(null)
    renderHook(() => useWebSocket({ url: 'http://h/ws' }))
    expect(FakeWs.all).toHaveLength(0)
  })

  it('reconnects after close and closes on error', () => {
    jest.useFakeTimers()
    const onDisconnect = jest.fn()
    renderHook(() => useWebSocket({ url: 'http://h/ws', onDisconnect }))
    act(() => FakeWs.all[0]!.onerror())
    expect(onDisconnect).toHaveBeenCalled()
    act(() => {
      jest.advanceTimersByTime(3100)
    })
    expect(FakeWs.all).toHaveLength(2)
    jest.useRealTimers()
  })

  it('does not reconnect after unmount or when disabled', () => {
    jest.useFakeTimers()
    const off = renderHook(() =>
      useWebSocket({ url: 'http://h/ws', autoReconnect: false }),
    )
    act(() => FakeWs.all[0]!.close())
    act(() => {
      jest.advanceTimersByTime(5000)
    })
    expect(FakeWs.all).toHaveLength(1)
    off.unmount()
    const on = renderHook(() => useWebSocket({ url: 'http://h/ws' }))
    on.unmount()
    act(() => {
      jest.advanceTimersByTime(5000)
    })
    expect(FakeWs.all).toHaveLength(2)
    jest.useRealTimers()
  })

  it('ignores send while closed', () => {
    const { result } = renderHook(() => useWebSocket({ url: 'http://h' }))
    FakeWs.all[0]!.readyState = 0
    act(() => result.current.send('x'))
    expect(FakeWs.all[0]!.sent).toEqual([])
  })
})
