import React from 'react'
import { render } from '@testing-library/react'
import SuperAdminNav from '@/components/super-admin/SuperAdminNav'

/** Expected nav item configuration. */
interface NavItem {
  testId: string
  label: string
  path: string
}

export const NAV_ITEMS: NavItem[] = [
  {
    testId: 'super-admin-nav-dashboard',
    label: 'Dashboard',
    path: '/super-admin',
  },
  {
    testId: 'super-admin-nav-tenants',
    label: 'Tenants',
    path: '/super-admin/tenants',
  },
  {
    testId: 'super-admin-nav-users',
    label: 'Users',
    path: '/super-admin/users',
  },
  {
    testId: 'super-admin-nav-settings',
    label: 'Settings',
    path: '/super-admin/settings',
  },
]

const DEFAULT_WIDTH = 260

/** Render with a default width. Optionally pass onNavClick. */
export function renderNav(onNavClick?: jest.Mock) {
  return render(<SuperAdminNav width={DEFAULT_WIDTH} onNavClick={onNavClick} />)
}
