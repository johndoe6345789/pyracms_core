import { render, screen, fireEvent } from '@testing-library/react'
import NotificationList from '@/components/common/notification/NotificationList'
import api from '@/lib/api'

let onMessage: (d: unknown) => void = () => {}
jest.mock('@/hooks/useWebSocket', () => ({
  useWebSocket: (o: { onMessage: (d: unknown) => void }) => {
    onMessage = o.onMessage
  },
}))
jest.mock('@/lib/api', () => ({
  __esModule: true, default: { get: jest.fn(), put: jest.fn() },
}))
const m = api as unknown as Record<string, jest.Mock>
beforeEach(() => Object.values(m).forEach((f) => f.mockReset()))

const n = (id: number, read = false, type = 'reply') => ({ id, type,
  title: `t${id}`, message: 'm', link: null, is_read: read,
  created_at: '' })

describe('NotificationList', () => {
  const p = { loading: false, isAuthenticated: true, onMarkRead: jest.fn() }
  it('covers guest, loading and empty', () => {
    const { rerender } = render(<NotificationList {...p}
      isAuthenticated={false} notifications={[]} />)
    expect(screen.getByText(/Sign in/)).toBeInTheDocument()
    rerender(<NotificationList {...p} loading notifications={[]} />)
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
    rerender(<NotificationList {...p} notifications={[]} />)
    expect(screen.getByText('No notifications')).toBeInTheDocument()
  })

  it('marks items read and falls back to the system icon', () => {
    render(<NotificationList {...p} notifications={
      [n(1), n(2, true, 'unknown')]} />)
    fireEvent.click(screen.getByTestId('notification-item-2'))
    expect(p.onMarkRead).toHaveBeenCalledWith(2)
  })
})
