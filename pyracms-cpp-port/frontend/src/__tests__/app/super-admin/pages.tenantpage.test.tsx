import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

jest.mock(
  '@/components/super-admin/TenantManagementTable',
  () =>
    jest.requireActual('@/__tests__/helpers/superAdminPagesMocks')
      .tenantTableMock,
)

import SuperAdminTenantsPage from '@/app/super-admin/tenants/page'

describe('/super-admin/tenants page', () => {
  beforeEach(() => render(<SuperAdminTenantsPage />))

  it('renders the page wrapper', () => {
    expect(screen.getByTestId('super-admin-tenants-page')).toBeInTheDocument()
  })

  it('renders the "Tenants" h1 heading', () => {
    expect(
      screen.getByRole('heading', { name: 'Tenants', level: 1 }),
    ).toBeInTheDocument()
  })

  it('renders a "New Site" button', () => {
    expect(screen.getByTestId('new-tenant-button')).toBeInTheDocument()
    expect(screen.getByTestId('new-tenant-button')).toHaveTextContent(
      'New Site',
    )
  })

  it('"New Site" button links to /create-site', () => {
    const btn = screen.getByTestId('new-tenant-button')
    // MUI Button rendered as Link wraps the element
    // in an <a>; check the closest anchor href.
    expect(btn.closest('a')).toHaveAttribute('href', '/create-site')
  })

  it('"New Site" button has aria-label for keyboard users', () => {
    expect(screen.getByTestId('new-tenant-button')).toHaveAttribute(
      'aria-label',
      'Create new site',
    )
  })

  it('renders the TenantManagementTable', () => {
    expect(
      screen.getByTestId('mock-tenant-management-table'),
    ).toBeInTheDocument()
  })
})
