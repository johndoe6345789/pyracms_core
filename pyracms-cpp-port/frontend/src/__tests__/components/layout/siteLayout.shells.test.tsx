import { screen, fireEvent } from '@testing-library/react'
import TenantDrawer from '@/components/layout/TenantDrawer'
import TenantAppBar from '@/components/layout/TenantAppBar'
import PortalShell from '@/components/layout/PortalShell'
import { renderWithStore, makeUser } from '../../helpers/renderWithStore'
import { UserRole } from '@/types'

jest.mock('next/navigation', () => ({
  usePathname: () => '/',
  useParams: () => ({}),
  useRouter: () => ({ push: jest.fn() }),
}))

describe('tenant shells', () => {
  it('renders drawer with default subtitle', () => {
    renderWithStore(
      <TenantDrawer
        slug="d"
        siteName="Demo"
        canAdmin={false}
        open
        onClose={jest.fn()}
      />,
    )
    expect(screen.getByText('Site navigation')).toBeInTheDocument()
  })

  it('renders drawer with description', () => {
    renderWithStore(
      <TenantDrawer
        slug="d"
        siteName="Demo"
        description="Hello"
        canAdmin
        open
        onClose={jest.fn()}
      />,
    )
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })

  it('toggles the app bar menu', () => {
    const onMenu = jest.fn()
    renderWithStore(
      <TenantAppBar
        slug="d"
        siteName="Demo"
        drawerOpen={false}
        onMenuClick={onMenu}
      />,
    )
    expect(screen.getByTestId('site-name-link')).toHaveAttribute(
      'href',
      '/site/d',
    )
  })

  it('portal shell opens the drawer and shows super admin', () => {
    renderWithStore(<PortalShell />, makeUser({ role: UserRole.SuperAdmin }))
    fireEvent.click(screen.getByTestId('menu-toggle'))
    expect(screen.getByTestId('portal-drawer')).toBeInTheDocument()
    expect(screen.getByText('Platform owner')).toBeInTheDocument()
  })
})
