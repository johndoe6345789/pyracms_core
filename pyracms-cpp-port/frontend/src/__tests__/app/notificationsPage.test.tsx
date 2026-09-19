import { screen, fireEvent, waitFor } from '@testing-library/react'
import { renderWithStore, makeUser } from '../helpers/renderWithStore'
import NotificationsPage from '@/app/site/[slug]/(tenant)/notifications/page'
import { m } from '../helpers/scopeApi'

jest.mock('@/lib/api', () => jest.requireActual('../helpers/apiMock').apiMock)

const row = (id: number, isRead: boolean, link = '/site/s/forum') => ({
  id,
  type: 'reply',
  title: `N${id}`,
  message: 'm',
  link,
  isRead,
  createdAt: '2026-01-01T00:00:00Z',
})

const show = () => renderWithStore(<NotificationsPage />, makeUser())
const del = async (id: number) =>
  fireEvent.click(
    (await screen.findByTestId(`note-${id}`)).querySelector(
      '[aria-label="Delete"]',
    ) as HTMLElement,
  )

beforeEach(() => {
  jest.resetAllMocks()
  m.get.mockResolvedValue({ data: [row(1, false), row(2, true, 'x:y')] })
  m.put.mockResolvedValue({})
  m.delete.mockResolvedValue({})
})

it('asks guests to sign in without calling the API', () => {
  renderWithStore(<NotificationsPage />)
  expect(screen.getByText(/Sign in/)).toBeInTheDocument()
  expect(m.get).not.toHaveBeenCalled()
})

it('lists notifications and marks one read', async () => {
  show()
  expect(await screen.findByRole('link', { name: 'N1' })).toHaveAttribute(
    'href',
    '/site/s/forum',
  )
  expect(screen.queryByRole('link', { name: 'N2' })).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: 'Mark read' }))
  await waitFor(() =>
    expect(m.put).toHaveBeenCalledWith('/api/notifications/1/read'),
  )
  await waitFor(() => expect(screen.queryByTestId('mark-all-read')).toBeNull())
})

it('marks all read and deletes', async () => {
  show()
  fireEvent.click(await screen.findByTestId('mark-all-read'))
  await waitFor(() =>
    expect(m.put).toHaveBeenCalledWith('/api/notifications/read-all'),
  )
  await del(1)
  await waitFor(() =>
    expect(m.delete).toHaveBeenCalledWith('/api/notifications/1'),
  )
  await waitFor(() => expect(screen.queryByTestId('note-1')).toBeNull())
})

it('reports a failed action', async () => {
  m.delete.mockRejectedValue({ response: { data: { error: 'no' } } })
  show()
  await del(1)
  expect(await screen.findByTestId('notifications-error')).toHaveTextContent(
    'no',
  )
})
