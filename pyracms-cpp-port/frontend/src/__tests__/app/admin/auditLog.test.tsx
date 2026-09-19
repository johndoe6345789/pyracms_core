import { render, screen } from '@testing-library/react'
import AuditLogPage from '@/app/site/[slug]/(admin)/admin/audit/page'
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

beforeEach(() => jest.resetAllMocks())

it('renders audit entries from /api/audit', async () => {
  m.get.mockResolvedValue({
    data: [
      {
        id: 1,
        actor: 'ann',
        action: 'user.ban',
        target: 'bob',
        createdAt: '2026-01-01T00:00:00Z',
      },
    ],
  })
  render(<AuditLogPage />)
  expect(await screen.findByTestId('audit-row-1')).toHaveTextContent('user.ban')
  expect(m.get).toHaveBeenCalledWith('/api/audit?tenant_id=1&limit=100')
})

it('shows an empty state', async () => {
  m.get.mockResolvedValue({ data: [] })
  render(<AuditLogPage />)
  expect(await screen.findByText('No audit entries yet.')).toBeVisible()
})

it('shows the API error', async () => {
  m.get.mockRejectedValue({ response: { data: { error: 'forbidden' } } })
  render(<AuditLogPage />)
  expect(await screen.findByTestId('audit-error')).toHaveTextContent(
    'forbidden',
  )
})
