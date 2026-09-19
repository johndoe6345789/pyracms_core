import { render, screen, waitFor } from '@testing-library/react'
import TenantAdminLayout from '@/app/site/[slug]/(admin)/admin/layout'
import DashboardPage from '@/app/site/[slug]/(admin)/admin/page'
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
jest.mock('@/components/dashboard/DashboardStats',
  () => () => <i data-testid="stats" />)

beforeEach(() => jest.resetAllMocks())

const media = (matches: boolean) => {
  window.matchMedia = jest.fn().mockReturnValue({
    matches, addListener: jest.fn(), removeListener: jest.fn(),
    addEventListener: jest.fn(), removeEventListener: jest.fn(),
  })
}

it('layout renders a permanent sidebar on desktop', () => {
  media(false)
  render(<TenantAdminLayout><p>kid</p></TenantAdminLayout>)
  expect(screen.getByTestId('admin-sidebar')).toBeInTheDocument()
  expect(screen.getByTestId('admin-main-content')).toHaveTextContent('kid')
})

it('layout opens and closes the mobile drawer', () => {
  media(true)
  render(<TenantAdminLayout><p>kid</p></TenantAdminLayout>)
  screen.getByTestId('admin-menu-toggle').click()
  return waitFor(() => screen.getByTestId('admin-nav-users').click())
})

it('dashboard page shows quick links and real activity', async () => {
  m.get.mockResolvedValue({ data: [{ id: 1, type: 'article', actor: 'a',
    title: 'Hello', link: '/x', createdAt: '2026-01-01T00:00:00Z' }] })
  render(<DashboardPage />)
  expect(await screen.findByTestId('activity-1')).toBeInTheDocument()
  expect(m.get).toHaveBeenCalledWith('/api/activity?tenant_id=3&limit=10')
  expect(screen.getByTestId('stats')).toBeInTheDocument()
  expect(screen.getByTestId('quick-link-users')).toBeInTheDocument()
})

it('redirect page goes to the first tenant', async () => {
  m.get.mockResolvedValue({ data: [{ slug: 'first' }] })
  render(<AdminRedirectPage />)
  await waitFor(() => expect(replace).toHaveBeenCalledWith(
    '/site/first/admin'))
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
