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

it('edits without resending an empty secret', async () => {
  render(<WebhooksPage />)
  fireEvent.click(await screen.findByLabelText('Edit'))
  fireEvent.click(screen.getByLabelText('user.registered'))
  fireEvent.click(screen.getByRole('button', { name: 'Save' }))
  await waitFor(() =>
    expect(m.put).toHaveBeenCalledWith('/api/webhooks/7', {
      url: 'https://x.io/h',
      events: ['article.created', 'user.registered'],
      active: true,
    }),
  )
})
