import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import WebhooksPage from '@/app/site/[slug]/(admin)/admin/webhooks/page'
import { m } from '../../helpers/scopeApi'

jest.mock('@/lib/api', () => require('../../helpers/apiMock').apiMock)

jest.mock('next/navigation', () => require('../../helpers/scopeMocks').navMock)

jest.mock(
  '@/hooks/useTenantId',
  () => require('../../helpers/scopeMocks').tenantMock,
)

const hook = {
  id: 7,
  url: 'https://x.io/h',
  active: true,
  events: ['article.created'],
  createdAt: '2026-01-01T00:00:00Z',
}

beforeEach(() => {
  jest.resetAllMocks()
  m.get.mockImplementation((u: string) =>
    Promise.resolve({
      data: u.includes('deliveries')
        ? [
            {
              id: 3,
              event: 'article.created',
              statusCode: 200,
              deliveredAt: '2026-01-02T00:00:00Z',
            },
          ]
        : [hook],
    }),
  )
  m.post.mockResolvedValue({})
  m.put.mockResolvedValue({})
  m.delete.mockResolvedValue({})
})

it('shows a save error and keeps the form open', async () => {
  m.post.mockRejectedValue({ response: { data: { error: 'bad url' } } })
  m.get.mockResolvedValue({ data: [] })
  render(<WebhooksPage />)
  fireEvent.click(await screen.findByTestId('webhook-new'))
  fireEvent.change(screen.getByLabelText('Payload URL'), {
    target: { value: 'http://l' },
  })
  fireEvent.click(screen.getByLabelText('comment.created'))
  fireEvent.click(screen.getByRole('button', { name: 'Save' }))
  expect(await screen.findByTestId('webhook-error')).toHaveTextContent(
    'bad url',
  )
})

it('deletes after confirmation and shows deliveries', async () => {
  render(<WebhooksPage />)
  fireEvent.click(await screen.findByLabelText('Deliveries'))
  expect(await screen.findByTestId('delivery-3')).toHaveTextContent('200')
  fireEvent.click(screen.getByRole('button', { name: 'Close' }))
  fireEvent.click(screen.getByLabelText('Delete'))
  fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
  await waitFor(() => expect(m.delete).toHaveBeenCalledWith('/api/webhooks/7'))
  await waitFor(() => expect(screen.queryByTestId('webhook-row-7')).toBeNull())
})
