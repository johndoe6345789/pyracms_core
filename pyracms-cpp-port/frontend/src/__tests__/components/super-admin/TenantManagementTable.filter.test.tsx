/** Tests for TenantManagementTable filter input. */
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
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

  it('renders the filter input', () => {
    render(<TenantManagementTable />)
    expect(screen.getByTestId('tenant-filter-input')).toBeInTheDocument()
  })

  it('filter input has aria-label "Filter tenants"', () => {
    render(<TenantManagementTable />)
    expect(
      screen.getByRole('textbox', { name: /filter tenants/i }),
    ).toBeInTheDocument()
  })

  it('filters rows by name (case-insensitive)', () => {
    resetHook({ tenants: [TENANT_A, TENANT_B] })
    render(<TenantManagementTable />)
    const input = screen.getByRole('textbox', {
      name: /filter tenants/i,
    })
    fireEvent.change(input, { target: { value: 'alpha' } })
    expect(screen.getByTestId('tenant-row-alpha')).toBeInTheDocument()
    expect(screen.queryByTestId('tenant-row-beta')).not.toBeInTheDocument()
  })

  it('filter is case-insensitive', () => {
    resetHook({ tenants: [TENANT_A, TENANT_B] })
    render(<TenantManagementTable />)
    const input = screen.getByRole('textbox', {
      name: /filter tenants/i,
    })
    fireEvent.change(input, { target: { value: 'ALPHA' } })
    expect(screen.getByTestId('tenant-row-alpha')).toBeInTheDocument()
    expect(screen.queryByTestId('tenant-row-beta')).not.toBeInTheDocument()
  })
})
