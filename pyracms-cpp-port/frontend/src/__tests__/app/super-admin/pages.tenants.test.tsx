import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
jest.mock('@/components/super-admin/SuperAdminDashboard', () =>
  require('@/__tests__/helpers/superAdminPagesMocks')
    .dashboardMock)
jest.mock('@/components/super-admin/TenantManagementTable', () =>
  require('@/__tests__/helpers/superAdminPagesMocks')
    .tenantTableMock)

import SuperAdminPage
  from '@/app/super-admin/page'
import SuperAdminTenantsPage
  from '@/app/super-admin/tenants/page'

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
