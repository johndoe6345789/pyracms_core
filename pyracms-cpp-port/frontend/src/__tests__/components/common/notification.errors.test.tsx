import { screen, fireEvent, waitFor } from '@testing-library/react'
import NotificationBell from '@/components/common/notification/NotificationBell'
import { renderWithStore, makeUser } from '../../helpers/renderWithStore'
import api from '@/lib/api'

jest.mock('@/hooks/useWebSocket', () => ({ useWebSocket: jest.fn() }))
jest.mock('@/lib/api', () => ({
  __esModule: true, default: { get: jest.fn(), put: jest.fn() },
}))
const m = api as unknown as Record<string, jest.Mock>
const boom = { response: { data: { error: 'boom' } } }
const n = { id: 3, type: 'reply', title: 't', message: 'm', link: null,
  is_read: false, created_at: '' }
beforeEach(() => {
  Object.values(m).forEach((f) => f.mockReset())
  m.get!.mockImplementation((u: string) => Promise.resolve({
    data: u.includes('unread') ? { count: 1 } : { notifications: [n] },
  }))
})
const open = async () => {
  renderWithStore(<NotificationBell />, makeUser())
  fireEvent.click(screen.getByTestId('notification-bell-btn'))
  await screen.findByTestId('notification-item-3')
}

it('shows a mark-all-read failure', async () => {
  m.put!.mockRejectedValue(boom)
  await open()
  fireEvent.click(screen.getByTestId('mark-all-read-btn'))
  expect(await screen.findByTestId('notification-error'))
    .toHaveTextContent('boom')
})

it('shows a mark-one failure, cleared once it succeeds', async () => {
  m.put!.mockRejectedValueOnce(boom).mockResolvedValue({})
  await open()
  fireEvent.click(screen.getByTestId('notification-item-3'))
  expect(await screen.findByTestId('notification-error'))
    .toHaveTextContent('boom')
  fireEvent.click(screen.getByTestId('notification-item-3'))
  await waitFor(() => expect(screen.queryByTestId('notification-error'))
    .toBeNull())
})
