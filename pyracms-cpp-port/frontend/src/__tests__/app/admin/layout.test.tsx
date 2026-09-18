import { render, screen, fireEvent } from '@testing-library/react'
import TenantAdminLayout from
  '@/app/site/[slug]/(admin)/admin/layout'
import { buildAdminNavItems } from
  '@/components/admin/layout/adminNavItems'

let mobile = false
jest.mock('next/navigation', () => ({
  useParams: () => ({ slug: 'demo' }),
}))
jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => mobile,
}))
const stub = (id: string) => ({
  __esModule: true,
  default: () => <div data-testid={id} />,
})
jest.mock('@/components/common/NotificationBell', () => stub('bell'))
jest.mock('@/components/common/TenantBreadcrumbs', () => stub('crumbs'))
jest.mock('@/components/common/ThemeToggle', () => stub('theme'))
jest.mock('@/components/common/LanguageSelect', () => stub('lang'))
jest.mock('@/components/common/UserBubble', () => stub('user'))

beforeEach(() => {
  mobile = false
})

describe('TenantAdminLayout', () => {
  it('renders desktop sidebar, nav and children', () => {
    render(<TenantAdminLayout><p>kid</p></TenantAdminLayout>)
    expect(screen.getByTestId('admin-sidebar')).toBeInTheDocument()
    expect(screen.getByText('kid')).toBeInTheDocument()
    expect(screen.getByText('demo Admin')).toBeInTheDocument()
    expect(screen.getByTestId('admin-nav-feature-toggles'))
      .toHaveAttribute('href', '/site/demo/admin/features')
    expect(screen.getByTestId('admin-back-to-site'))
      .toHaveAttribute('href', '/site/demo')
    expect(screen.queryByTestId('admin-menu-toggle')).toBeNull()
  })

  it('opens and closes the mobile drawer', () => {
    mobile = true
    render(<TenantAdminLayout><p>kid</p></TenantAdminLayout>)
    expect(screen.queryByTestId('admin-nav-list')).toBeNull()
    fireEvent.click(screen.getByTestId('admin-menu-toggle'))
    expect(screen.getByTestId('admin-drawer-mobile')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('admin-nav-users'))
  })

  it('skip link toggles styles on focus/blur', () => {
    render(<TenantAdminLayout><p>kid</p></TenantAdminLayout>)
    const a = screen.getByTestId('skip-to-content')
    fireEvent.focus(a)
    expect(a.style.position).toBe('fixed')
    fireEvent.blur(a)
    expect(a.style.position).toBe('absolute')
  })

  it('builds nav items for slug', () => {
    const items = buildAdminNavItems('x')
    expect(items).toHaveLength(11)
    expect(items[0].path).toBe('/site/x/admin')
  })
})
