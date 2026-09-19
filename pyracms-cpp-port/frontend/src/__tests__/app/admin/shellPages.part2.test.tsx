import '../../helpers/adminShellMocks'
import { render, screen } from '@testing-library/react'
import DashboardPage from '@/app/site/[slug]/(admin)/admin/page'
import { m } from '../../helpers/scopeApi'

jest.mock(
  '@/lib/api',
  () => jest.requireActual('../../helpers/apiMock').apiMock,
)

jest.mock(
  'next/navigation',
  () => jest.requireActual('../../helpers/scopeMocks').navMock,
)

jest.mock('@/hooks/useAdminGate', () => ({
  useAdminGate: () => ({ slug: 's', allowed: true, checking: false }),
}))

jest.mock('@/hooks/useTenantId', () => ({
  useTenantId: () => ({ tenantId: 3, loading: false }),
}))

beforeEach(() => jest.resetAllMocks())

it('dashboard page shows quick links and real activity', async () => {
  m.get.mockResolvedValue({
    data: [
      {
        id: 1,
        type: 'article',
        actor: 'a',
        title: 'Hello',
        link: '/x',
        createdAt: '2026-01-01T00:00:00Z',
      },
    ],
  })
  render(<DashboardPage />)
  expect(await screen.findByTestId('activity-1')).toBeInTheDocument()
  expect(m.get).toHaveBeenCalledWith('/api/activity?tenant_id=3&limit=10')
  expect(screen.getByTestId('stats')).toBeInTheDocument()
  expect(screen.getByTestId('quick-link-users')).toBeInTheDocument()
})
