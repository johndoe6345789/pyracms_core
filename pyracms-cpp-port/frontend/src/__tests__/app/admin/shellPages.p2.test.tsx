import { render, screen, waitFor } from '@testing-library/react'
import AdminRedirectPage from '@/app/admin/page'
import { m } from '../../helpers/scopeApi'
import { replace } from '../../helpers/scopeMocks'

jest.mock('@/lib/api', () => require('../../helpers/apiMock').apiMock)

jest.mock('next/navigation', () => require('../../helpers/scopeMocks').navMock)

jest.mock('@/hooks/useAdminGate', () => ({
  useAdminGate: () => ({ slug: 's', allowed: true, checking: false }),
}))

jest.mock('@/hooks/useTenantId', () => ({
  useTenantId: () => ({ tenantId: 3, loading: false }),
}))

jest.mock('@/components/common/TenantBreadcrumbs', () => () => <i />)

jest.mock('@/components/common/NotificationBell', () => () => <i />)

jest.mock('@/components/common/ThemeToggle', () => () => <i />)

jest.mock('@/components/common/LanguageSelect', () => () => <i />)

jest.mock('@/components/common/UserBubble', () => () => <i />)

jest.mock('@/components/dashboard/DashboardStats', () => () => (
  <i data-testid="stats" />
))

beforeEach(() => jest.resetAllMocks())

it('redirect page goes to the first tenant', async () => {
  m.get.mockResolvedValue({ data: [{ slug: 'first' }] })
  render(<AdminRedirectPage />)
  await waitFor(() => expect(replace).toHaveBeenCalledWith('/site/first/admin'))
})

it('redirect page reports empty and failing loads', async () => {
  m.get.mockResolvedValueOnce({ data: null })
  const { unmount } = render(<AdminRedirectPage />)
  await screen.findByText(/No tenants found/)
  unmount()
  m.get.mockRejectedValueOnce(new Error('x'))
  render(<AdminRedirectPage />)
  await screen.findByText('Failed to load tenants')
})
