import { render, screen, fireEvent } from '@testing-library/react'
import AppDrawer from '@/components/layout/AppDrawer'
import TopBarLinks from '@/components/layout/TopBarLinks'
import { isActive } from '@/components/layout/navTypes'
import {
  tenantSections, tenantModuleEntries, portalEntries, portalSections,
  TENANT_FOOTER,
} from '@/components/layout/navConfig'

let path = '/site/demo/forum'
jest.mock('next/navigation', () => ({ usePathname: () => path }))

describe('nav config', () => {
  it('builds tenant sections with optional admin', () => {
    expect(tenantSections('d', false)).toHaveLength(1)
    const s = tenantSections('d', true)
    expect(s[1]?.items[0]?.href).toBe('/site/d/admin')
    expect(tenantModuleEntries('d')[0]?.href).toBe('/site/d/articles')
  })

  it('builds portal sections', () => {
    expect(portalEntries().length).toBeGreaterThan(2)
    expect(portalSections(false)).toHaveLength(1)
    expect(portalSections(true)[1]?.title).toBe('Platform')
  })

  it('matches active routes', () => {
    const e = { key: 'k', label: 'K', href: '/a#x', icon: null }
    expect(isActive('/a/b', e)).toBe(true)
    expect(isActive('/a/b', { ...e, exact: true })).toBe(false)
    expect(isActive('/a', { ...e, exact: true })).toBe(true)
  })
})

describe('AppDrawer', () => {
  const onClose = jest.fn()
  const render1 = (footer?: boolean) => render(
    <AppDrawer open onClose={onClose} title="T" subtitle="Sub"
      sections={tenantSections('demo', true)}
      {...(footer ? { footer: TENANT_FOOTER } : {})} />)

  it('renders header, active item and footer', () => {
    render1(true)
    expect(screen.getByText('Sub')).toBeInTheDocument()
    expect(screen.getByTestId('drawer-nav-forum'))
      .toHaveAttribute('aria-current', 'page')
    expect(screen.getByTestId('drawer-admin')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('drawer-portal'))
    expect(onClose).toHaveBeenCalled()
  })

  it('omits footer and closes from the header', () => {
    render1(false)
    expect(screen.queryByTestId('drawer-portal')).toBeNull()
    fireEvent.click(screen.getByLabelText('Close navigation menu'))
    expect(onClose).toHaveBeenCalled()
  })
})

describe('TopBarLinks', () => {
  it('marks the active link', () => {
    render(<TopBarLinks items={tenantModuleEntries('demo')}
      pathname="/site/demo/forum" />)
    expect(screen.getByTestId('nav-forum'))
      .toHaveAttribute('aria-current', 'page')
    expect(screen.getByTestId('nav-tags')).not.toHaveAttribute('aria-current')
  })
})
