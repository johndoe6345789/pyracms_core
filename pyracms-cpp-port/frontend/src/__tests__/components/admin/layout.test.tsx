import '../../helpers/adminBarMocks'
import { render, screen, fireEvent } from '@testing-library/react'
import AdminDrawerContent from '@/components/admin/layout/AdminDrawerContent'
import AdminSidebar from '@/components/admin/layout/AdminSidebar'
import AdminTopBar from '@/components/admin/layout/AdminTopBar'
import SkipLink from '@/components/admin/layout/SkipLink'
import { buildQuickLinks } from '@/components/admin/dashboard/quickLinks'

it('drawer content links navigate', () => {
  const onNavigate = jest.fn()
  render(<AdminDrawerContent slug="s" onNavigate={onNavigate} />)
  const link = screen.getByTestId('admin-nav-feature-toggles')
  expect(link).toHaveAttribute('href', '/site/s/admin/features')
  fireEvent.click(link)
  fireEvent.click(screen.getByTestId('admin-back-to-site'))
  expect(onNavigate).toHaveBeenCalledTimes(2)
})

it('sidebar renders desktop and mobile variants', () => {
  const { rerender } = render(
    <AdminSidebar isMobile={false} open={false} onClose={jest.fn()}>
      <p>kid</p>
    </AdminSidebar>,
  )
  expect(screen.getByTestId('admin-sidebar')).toHaveTextContent('kid')
  const onClose = jest.fn()
  rerender(
    <AdminSidebar isMobile open onClose={onClose}>
      <p>kid</p>
    </AdminSidebar>,
  )
  expect(screen.getByTestId('admin-drawer-mobile')).toBeInTheDocument()
  fireEvent.keyDown(screen.getByText('kid'), { key: 'Escape' })
  expect(onClose).toHaveBeenCalled()
})

it('top bar shows the menu toggle on mobile only', () => {
  const onMenu = jest.fn()
  const { rerender } = render(
    <AdminTopBar slug="s" isMobile={false} onMenu={onMenu} />,
  )
  expect(screen.queryByTestId('admin-menu-toggle')).toBeNull()
  expect(screen.getByText('s Admin')).toBeInTheDocument()
  rerender(<AdminTopBar slug="s" isMobile onMenu={onMenu} />)
  fireEvent.click(screen.getByTestId('admin-menu-toggle'))
  expect(onMenu).toHaveBeenCalled()
  expect(screen.getByTestId('admin-site-link')).toHaveAttribute(
    'href',
    '/site/s',
  )
})

it('skip link reveals on focus and hides on blur', () => {
  render(<SkipLink />)
  const a = screen.getByTestId('skip-to-content')
  fireEvent.focus(a)
  expect(a.style.position).toBe('fixed')
  fireEvent.blur(a)
  expect(a.style.position).toBe('absolute')
})

it('builds quick links', () => {
  expect(buildQuickLinks('s')[0]!.href).toBe('/site/s/admin/users')
  expect(buildQuickLinks('s')).toHaveLength(7)
})
