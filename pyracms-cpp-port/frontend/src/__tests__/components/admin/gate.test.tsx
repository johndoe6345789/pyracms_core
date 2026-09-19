import { render, screen } from '@testing-library/react'
import AdminGate from '@/components/admin/layout/AdminGate'
import TenantAdminLayout from '@/app/site/[slug]/(admin)/admin/layout'

let gate = { slug: 'my site', allowed: false, checking: false }
jest.mock('@/hooks/useAdminGate', () => ({ useAdminGate: () => gate }))
jest.mock(
  '@/components/admin/layout/AdminShell',
  () => jest.requireActual('../../helpers/stubs').ShellStub,
)

beforeEach(() => {
  gate = { slug: 'my site', allowed: false, checking: false }
})

it('shows a spinner while checking, never the forbidden state', () => {
  gate = { ...gate, checking: true }
  render(
    <AdminGate>
      <p>secret</p>
    </AdminGate>,
  )
  expect(screen.getByTestId('admin-gate-loading')).toBeInTheDocument()
  expect(screen.queryByTestId('admin-forbidden')).toBeNull()
  expect(screen.queryByText('secret')).toBeNull()
})

it('explains the requirement with a sign-in link', () => {
  render(
    <AdminGate>
      <p>secret</p>
    </AdminGate>,
  )
  expect(screen.getByText('Administrator access required')).toBeInTheDocument()
  expect(screen.getByTestId('admin-forbidden-signin')).toHaveAttribute(
    'href',
    '/auth/login?tenant=my%20site',
  )
  expect(screen.getByTestId('admin-forbidden-back')).toHaveAttribute(
    'href',
    '/site/my site',
  )
  expect(screen.queryByText('secret')).toBeNull()
})

it('renders children for administrators', () => {
  gate = { ...gate, allowed: true }
  render(
    <AdminGate>
      <p>secret</p>
    </AdminGate>,
  )
  expect(screen.getByText('secret')).toBeInTheDocument()
})

it('the admin layout is gated', () => {
  const { unmount } = render(
    <TenantAdminLayout>
      <p>kid</p>
    </TenantAdminLayout>,
  )
  expect(screen.queryByTestId('shell')).toBeNull()
  unmount()
  gate = { ...gate, allowed: true }
  render(
    <TenantAdminLayout>
      <p>kid</p>
    </TenantAdminLayout>,
  )
  expect(screen.getByTestId('shell')).toHaveTextContent('kid')
})
