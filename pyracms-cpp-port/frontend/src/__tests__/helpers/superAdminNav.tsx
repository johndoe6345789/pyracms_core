import { render } from '@testing-library/react'
import SuperAdminNav from '@/components/super-admin/SuperAdminNav'

/** Expected nav item configuration. */
export interface NavItem {
  testId: string
  label: string
  path: string
}

const P = '/super-admin'

export const NAV_ITEMS: NavItem[] = [
  { testId: 'super-admin-nav-dashboard', label: 'Dashboard', path: P },
  {
    testId: 'super-admin-nav-tenants',
    label: 'Tenants',
    path: `${P}/tenants`,
  },
  {
    testId: 'super-admin-nav-users',
    label: 'Users',
    path: `${P}/users`,
  },
  {
    testId: 'super-admin-nav-settings',
    label: 'Settings',
    path: `${P}/settings`,
  },
]

const DEFAULT_WIDTH = 260

/** Render with a default width. Optionally pass onNavClick. */
export function renderNav(onNavClick?: jest.Mock) {
  return render(
    <SuperAdminNav width={DEFAULT_WIDTH} onNavClick={onNavClick} />,
  )
}
