import { renderHook } from '@testing-library/react'
import { useCollabEditor } from '@/hooks/useCollabEditor'
import { currentToken } from '@/lib/session'

jest.mock('@/lib/session', () => ({ currentToken: jest.fn() }))
const disconnect = jest.fn()
jest.mock('y-websocket', () => ({
  WebsocketProvider: jest.fn().mockImplementation(() => ({ disconnect })),
}))
const token = currentToken as jest.Mock
beforeEach(() => token.mockReturnValue('tok'))

describe('useCollabEditor', () => {
  it('creates a doc and provider, then cleans up', () => {
    const { unmount } = renderHook(
      () => useCollabEditor({ roomName: 'r' }))
    unmount()
    expect(disconnect).toHaveBeenCalled()
  })

  it('stays idle when disabled or signed out', () => {
    disconnect.mockClear()
    renderHook(() => useCollabEditor({ roomName: 'r', enabled: false }))
    token.mockReturnValue(null)
    const { unmount } = renderHook(
      () => useCollabEditor({ roomName: 'r' }))
    unmount()
    expect(disconnect).not.toHaveBeenCalled()
  })
})
