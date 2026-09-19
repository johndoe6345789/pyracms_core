import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import WebhooksPage from '@/app/site/[slug]/(admin)/admin/webhooks/page'
import { m } from '../../helpers/scopeApi'

jest.mock(
  '@/lib/api',
  () => jest.requireActual('../../helpers/apiMock').apiMock,
)

jest.mock(
  'next/navigation',
  () => jest.requireActual('../../helpers/scopeMocks').navMock,
)

jest.mock(
  '@/hooks/useTenantId',
  () => jest.requireActual('../../helpers/scopeMocks').tenantMock,
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

it('lists webhooks for the tenant', async () => {
  render(<WebhooksPage />)
  expect(await screen.findByTestId('webhook-row-7')).toHaveTextContent('x.io')
  expect(m.get).toHaveBeenCalledWith('/api/webhooks?tenant_id=1')
})

it('creates a webhook with chosen events', async () => {
  m.get.mockResolvedValue({ data: [] })
  render(<WebhooksPage />)
  expect(await screen.findByText('No webhooks configured.')).toBeVisible()
  fireEvent.click(screen.getByTestId('webhook-new'))
  fireEvent.change(screen.getByLabelText('Payload URL'), {
    target: { value: 'https://a.io/x' },
  })
  fireEvent.click(screen.getByLabelText('comment.created'))
  fireEvent.click(screen.getByRole('button', { name: 'Save' }))
  await waitFor(() =>
    expect(m.post).toHaveBeenCalledWith('/api/webhooks', {
      url: 'https://a.io/x',
      events: ['comment.created'],
      active: true,
      tenant_id: 1,
    }),
  )
})
