import { render, screen } from '@testing-library/react'
import { renderPlain } from '../../helpers/plainStore'
import AppDrawer from '@/components/layout/AppDrawer'
import AppTopBar from '@/components/layout/AppTopBar'
import SuperAdminBreadcrumbs
  from '@/components/super-admin/SuperAdminBreadcrumbs'

jest.mock('next/navigation', () => ({
  usePathname: () => null,
  useParams: () => ({}),
  useRouter: () => ({ push: jest.fn() }),
}))

const items = [{ key: 'h', label: 'Home', href: '/', icon: null }]

describe('components without a pathname', () => {
  it('AppDrawer renders untitled sections', () => {
    render(<AppDrawer open onClose={jest.fn()} title="T" sections={[
      { items }]} />)
    expect(screen.getByText('Home')).toBeInTheDocument()
  })

  it('AppTopBar renders', () => {
    renderPlain(<AppTopBar brand="B" brandHref="/" items={items}
      drawerOpen={false} onMenuClick={jest.fn()} navLabel="nav" />)
    expect(screen.getByTestId('tenant-appbar')).toBeInTheDocument()
  })

  it('SuperAdminBreadcrumbs defaults to the dashboard', () => {
    render(<SuperAdminBreadcrumbs />)
    expect(screen.getByTestId('breadcrumb-current'))
      .toHaveTextContent('Super Admin')
  })
})
