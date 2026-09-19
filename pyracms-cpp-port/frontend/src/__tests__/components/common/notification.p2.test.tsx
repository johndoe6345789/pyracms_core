import { screen, fireEvent, waitFor, act } from '@testing-library/react'
import NotificationBell from '@/components/common/notification'
import { makeUser } from '../../helpers/renderWithStore'
import { renderPlain as renderWithStore } from '../../helpers/plainStore'
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

describe('NotificationBell', () => {
  it('loads the list, marks one and all read', async () => {
    m.get!.mockImplementation((u: string) => Promise.resolve(
      u.includes('unread') ? { data: { count: 2 } }
        : { data: { notifications: [n(1), n(2)] } }))
    m.put!.mockResolvedValue({})
    renderWithStore(<NotificationBell />, makeUser())
    await waitFor(() => expect(m.get).toHaveBeenCalled())
    fireEvent.click(screen.getByTestId('notification-bell-btn'))
    fireEvent.click(await screen.findByTestId('notification-item-1'))
    await waitFor(() => expect(m.put).toHaveBeenCalledWith(
      '/api/notifications/1/read'))
    fireEvent.click(screen.getByTestId('mark-all-read-btn'))
    await waitFor(() => expect(m.put).toHaveBeenCalledWith(
      '/api/notifications/read-all'))
    await waitFor(() => expect(screen.queryByTestId('mark-all-read-btn'))
      .toBeNull())
  })

  it('ingests websocket notifications and survives errors', async () => {
    m.get!.mockRejectedValue(new Error('x'))
    m.put!.mockRejectedValue(new Error('x'))
    renderWithStore(<NotificationBell />, makeUser())
    act(() => {
      onMessage({ type: 'other' })
      onMessage({ type: 'notification', id: 9, title: 'hey' })
    })
    fireEvent.click(screen.getByTestId('notification-bell-btn'))
    await waitFor(() => expect(m.get).toHaveBeenCalledTimes(2))
    fireEvent.click(await screen.findByTestId('mark-all-read-btn'))
    await waitFor(() => expect(m.put).toHaveBeenCalled())
  })

  it('shows sign-in prompt for guests', async () => {
    renderWithStore(<NotificationBell />)
    fireEvent.click(screen.getByTestId('notification-bell-btn'))
    expect(await screen.findByText(/Sign in/)).toBeInTheDocument()
  })
})
