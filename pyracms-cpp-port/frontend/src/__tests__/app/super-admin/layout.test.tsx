import { render, screen, fireEvent } from '@testing-library/react'
import SuperAdminLayout from '@/app/super-admin/layout'
import SuperAdminSidebar from '@/components/super-admin/SuperAdminSidebar'
import { renderPlain } from '../../helpers/plainStore'
import { makeUser } from '../../helpers/renderWithStore'

let mobile = false
jest.mock('@mui/material', () => ({
  ...jest.requireActual('@mui/material'),
  useMediaQuery: () => mobile,
}))
jest.mock('next/navigation', () => ({
  usePathname: () => '/super-admin',
  useParams: () => ({}),
  useRouter: () => ({ push: jest.fn() }),
}))

const kid = <p>secret</p>

describe('SuperAdminLayout', () => {
  beforeEach(() => { mobile = false })

  it('blocks non-super-admins', () => {
    renderPlain(<SuperAdminLayout>{kid}</SuperAdminLayout>, makeUser())
    expect(screen.queryByText('secret')).toBeNull()
  })

  it('renders content for a super admin (desktop)', () => {
    renderPlain(<SuperAdminLayout>{kid}</SuperAdminLayout>,
      makeUser({ role: 4 } as never))
    expect(screen.getByText('secret')).toBeInTheDocument()
    expect(screen.getByTestId('super-admin-sidebar')).toBeInTheDocument()
    expect(screen.getByTestId('super-admin-breadcrumbs'))
      .toBeInTheDocument()
  })

  it('opens the mobile drawer from the app bar', () => {
    mobile = true
    renderPlain(<SuperAdminLayout>{kid}</SuperAdminLayout>,
      makeUser({ role: 4 } as never))
    fireEvent.click(screen.getByTestId('super-admin-menu-toggle'))
    expect(screen.getByTestId('super-admin-drawer-mobile'))
      .toBeInTheDocument()
  })
})

describe('SuperAdminSidebar', () => {
  it('closes the mobile drawer through the nav', () => {
    const onClose = jest.fn()
    render(<SuperAdminSidebar isMobile open onClose={onClose} />)
    fireEvent.click(screen.getAllByRole('link')[0]!)
    expect(onClose).toHaveBeenCalled()
  })

  it('renders a permanent rail on desktop', () => {
    render(<SuperAdminSidebar isMobile={false} open={false}
      onClose={jest.fn()} />)
    expect(screen.getByTestId('super-admin-sidebar')).toBeInTheDocument()
  })
})
