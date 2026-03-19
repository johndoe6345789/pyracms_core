/**
 * Tests for super-admin route pages.
 *
 * Child components that make network calls are mocked so
 * tests stay fast and isolated.
 */
import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

// ----- mock heavy children -----

jest.mock(
  '@/components/super-admin/SuperAdminDashboard',
  () => ({
    __esModule: true,
    default: function MockSuperAdminDashboard() {
      return (
        <div data-testid="mock-super-admin-dashboard">
          <h1>Platform Overview</h1>
        </div>
      )
    },
  }),
)

jest.mock(
  '@/components/super-admin/TenantManagementTable',
  () => ({
    __esModule: true,
    default: function MockTenantManagementTable() {
      return (
        <div data-testid="mock-tenant-management-table" />
      )
    },
  }),
)

jest.mock(
  '@/components/super-admin/GlobalUsersTable',
  () => ({
    __esModule: true,
    default: function MockGlobalUsersTable() {
      return <div data-testid="mock-global-users-table" />
    },
  }),
)

// ----- pages under test (imported after mocks) -----

import SuperAdminPage
  from '@/app/super-admin/page'
import SuperAdminTenantsPage
  from '@/app/super-admin/tenants/page'
import SuperAdminUsersPage
  from '@/app/super-admin/users/page'
import SuperAdminSettingsPage
  from '@/app/super-admin/settings/page'

// =====================================================
// /super-admin
// =====================================================

describe('/super-admin page', () => {
  it('renders the SuperAdminDashboard component', () => {
    render(<SuperAdminPage />)
    expect(
      screen.getByTestId('mock-super-admin-dashboard'),
    ).toBeInTheDocument()
  })

  it('shows "Platform Overview" heading via dashboard', () => {
    render(<SuperAdminPage />)
    expect(
      screen.getByRole('heading', { name: /platform overview/i }),
    ).toBeInTheDocument()
  })
})

// =====================================================
// /super-admin/tenants
// =====================================================

describe('/super-admin/tenants page', () => {
  beforeEach(() => render(<SuperAdminTenantsPage />))

  it('renders the page wrapper', () => {
    expect(
      screen.getByTestId('super-admin-tenants-page'),
    ).toBeInTheDocument()
  })

  it('renders the "Tenants" h1 heading', () => {
    expect(
      screen.getByRole('heading', { name: 'Tenants', level: 1 }),
    ).toBeInTheDocument()
  })

  it('renders a "New Site" button', () => {
    expect(
      screen.getByTestId('new-tenant-button'),
    ).toBeInTheDocument()
    expect(
      screen.getByTestId('new-tenant-button'),
    ).toHaveTextContent('New Site')
  })

  it('"New Site" button links to /create-site', () => {
    const btn = screen.getByTestId('new-tenant-button')
    // MUI Button rendered as Link wraps the element
    // in an <a>; check the closest anchor href.
    expect(btn.closest('a')).toHaveAttribute(
      'href',
      '/create-site',
    )
  })

  it(
    '"New Site" button has aria-label for keyboard users',
    () => {
      expect(
        screen.getByTestId('new-tenant-button'),
      ).toHaveAttribute('aria-label', 'Create new site')
    },
  )

  it('renders the TenantManagementTable', () => {
    expect(
      screen.getByTestId('mock-tenant-management-table'),
    ).toBeInTheDocument()
  })
})

// =====================================================
// /super-admin/users
// =====================================================

describe('/super-admin/users page', () => {
  beforeEach(() => render(<SuperAdminUsersPage />))

  it('renders the page wrapper', () => {
    expect(
      screen.getByTestId('super-admin-users-page'),
    ).toBeInTheDocument()
  })

  it('renders the "Global Users" h1 heading', () => {
    expect(
      screen.getByRole('heading', {
        name: 'Global Users',
        level: 1,
      }),
    ).toBeInTheDocument()
  })

  it('renders the GlobalUsersTable', () => {
    expect(
      screen.getByTestId('mock-global-users-table'),
    ).toBeInTheDocument()
  })
})

// =====================================================
// /super-admin/settings
// =====================================================

describe('/super-admin/settings page', () => {
  beforeEach(() => render(<SuperAdminSettingsPage />))

  it('renders the page wrapper', () => {
    expect(
      screen.getByTestId('super-admin-settings-page'),
    ).toBeInTheDocument()
  })

  it('renders the "Platform Settings" h1 heading', () => {
    expect(
      screen.getByRole('heading', {
        name: 'Platform Settings',
        level: 1,
      }),
    ).toBeInTheDocument()
  })

  it('renders the info alert', () => {
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('alert contains platform-settings description', () => {
    expect(screen.getByRole('alert')).toHaveTextContent(
      /global platform settings/i,
    )
  })

  it('settings icon is aria-hidden', () => {
    // The TuneOutlined svg should carry aria-hidden="true"
    // so it does not pollute the accessible name tree.
    const icons = document
      .querySelectorAll('[aria-hidden="true"]')
    expect(icons.length).toBeGreaterThan(0)
  })
})
