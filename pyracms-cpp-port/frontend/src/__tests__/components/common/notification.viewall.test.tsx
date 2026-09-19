import { screen, fireEvent, waitFor } from '@testing-library/react'
import NotificationBell from '@/components/common/notification'
import { mapNotificationList } from '../../helpers/imports/notificationApi'
import { makeUser } from '../../helpers/renderWithStore'
import { renderPlain as renderWithStore } from '../../helpers/plainStore'
import api from '@/lib/api'

let path = '/site/s/articles'
jest.mock('next/navigation', () => ({ usePathname: () => path }))
jest.mock('@/hooks/useWebSocket', () => ({ useWebSocket: () => undefined }))
jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { get: jest.fn(), put: jest.fn() },
}))
const m = api as unknown as Record<string, jest.Mock>

beforeEach(() => {
  Object.values(m).forEach((f) => f.mockReset())
  m.get!.mockImplementation((u: string) =>
    Promise.resolve(
      u.includes('unread')
        ? { data: { count: 1 } }
        : {
            data: [
              {
                id: 5,
                type: 'reply',
                title: 'hey',
                message: 'm',
                link: '',
                isRead: false,
                createdAt: '2026-01-01T00:00:00Z',
              },
            ],
          },
    ),
  )
})

it('links to the full page and reads the camelCase list', async () => {
  path = '/site/s/articles'
  renderWithStore(<NotificationBell />, makeUser())
  await waitFor(() => expect(m.get).toHaveBeenCalled())
  fireEvent.click(screen.getByTestId('notification-bell-btn'))
  expect(await screen.findByTestId('notification-item-5')).toBeInTheDocument()
  expect(screen.getByTestId('notifications-view-all')).toHaveAttribute(
    'href',
    '/site/s/notifications',
  )
})

it('has no View all link outside a site', async () => {
  path = '/auth/login'
  renderWithStore(<NotificationBell />, makeUser())
  fireEvent.click(screen.getByTestId('notification-bell-btn'))
  await screen.findByTestId('notification-item-5')
  expect(screen.queryByTestId('notifications-view-all')).toBeNull()
})

it('maps arrays, wrapped lists and junk', () => {
  expect(
    mapNotificationList({ notifications: [{ id: 1, is_read: 1 }] })[0],
  ).toMatchObject({ id: 1, is_read: true, type: 'system' })
  expect(mapNotificationList('nope')).toEqual([])
})
