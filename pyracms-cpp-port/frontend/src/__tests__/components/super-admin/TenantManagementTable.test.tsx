/** Tests for TenantManagementTable rendering. */
import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

import { TenantManagementTable } from '../../helpers/imports/tenantTable'
import { resetHook, TENANT_A, TENANT_B } from '../../helpers/tenantTableHelpers'

jest.mock('@/hooks/useSuperAdminTenants', () => ({
  useSuperAdminTenants: () =>
    jest.requireActual('@/__tests__/helpers/tenantTableHelpers').mockHookState,
}))
jest.mock(
  'next/link',
  () => jest.requireActual('@/__tests__/helpers/tenantTableHelpers').MockLink,
)

describe('TenantManagementTable', () => {
  beforeEach(() => resetHook())

  it('shows CircularProgress when loading is true', () => {
    resetHook({ loading: true })
    render(<TenantManagementTable />)
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
    expect(
      screen.queryByTestId('tenant-management-table'),
    ).not.toBeInTheDocument()
  })

  it('shows "No tenants found." when tenants array is empty', () => {
    render(<TenantManagementTable />)
    expect(screen.getByText('No tenants found.')).toBeInTheDocument()
  })

  it('renders one row per tenant', () => {
    resetHook({ tenants: [TENANT_A, TENANT_B] })
    render(<TenantManagementTable />)
    expect(screen.getByTestId('tenant-row-alpha')).toBeInTheDocument()
    expect(screen.getByTestId('tenant-row-beta')).toBeInTheDocument()
  })

  it('each row carries data-testid="tenant-row-{slug}"', () => {
    resetHook({ tenants: [TENANT_A] })
    render(<TenantManagementTable />)
    expect(
      screen.getByTestId(`tenant-row-${TENANT_A.slug}`),
    ).toBeInTheDocument()
  })
})
