import { render, screen, fireEvent } from '@testing-library/react'
import SkipLink from '@/components/layout/SkipLink'
import SiteNotFound from '@/components/layout/SiteNotFound'
import TenantModuleCards from '@/components/layout/TenantModuleCards'
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

describe('SkipLink', () => {
  it('reveals on focus and hides on blur', () => {
    render(<SkipLink />)
    const a = screen.getByTestId('skip-to-content')
    fireEvent.focus(a)
    expect(a.style.position).toBe('fixed')
    fireEvent.blur(a)
    expect(a.style.position).toBe('absolute')
  })
})

describe('SiteNotFound', () => {
  it('names the missing site', () => {
    render(<SiteNotFound slug="ghost" />)
    expect(screen.getByText('ghost')).toBeInTheDocument()
    expect(screen.getByText('Portal')).toHaveAttribute('href', '/')
  })
})

describe('TenantModuleCards', () => {
  it('shows admin card only for admins', () => {
    const { rerender } = render(<TenantModuleCards slug="d" />)
    expect(screen.getByTestId('module-games'))
      .toHaveAttribute('href', '/site/d/games')
    expect(screen.queryByTestId('module-admin')).toBeNull()
    rerender(<TenantModuleCards slug="d" canAdmin />)
    expect(screen.getByTestId('module-admin')).toBeInTheDocument()
  })
})

describe('tenant shells', () => {
  it('renders drawer with default subtitle', () => {
    render(<TenantDrawer slug="d" siteName="Demo" canAdmin={false}
      open onClose={jest.fn()} />)
    expect(screen.getByText('Site navigation')).toBeInTheDocument()
  })

  it('renders drawer with description', () => {
    render(<TenantDrawer slug="d" siteName="Demo" description="Hello"
      canAdmin open onClose={jest.fn()} />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })

  it('toggles the app bar menu', () => {
    const onMenu = jest.fn()
    renderWithStore(<TenantAppBar slug="d" siteName="Demo"
      drawerOpen={false} onMenuClick={onMenu} />)
    expect(screen.getByTestId('site-name-link'))
      .toHaveAttribute('href', '/site/d')
  })

  it('portal shell opens the drawer and shows super admin', () => {
    renderWithStore(<PortalShell />,
      makeUser({ role: UserRole.SuperAdmin }))
    fireEvent.click(screen.getByTestId('menu-toggle'))
    expect(screen.getByTestId('portal-drawer')).toBeInTheDocument()
    expect(screen.getByText('Super admin')).toBeInTheDocument()
  })
})
