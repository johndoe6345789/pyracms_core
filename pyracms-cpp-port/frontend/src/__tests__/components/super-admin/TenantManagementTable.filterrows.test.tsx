/** Tests for TenantManagementTable filtering rows. */
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'

import { TenantManagementTable } from '../../helpers/imports/tenantTable'
import { resetHook, TENANT_A, TENANT_B } from '../../helpers/tenantTableHelpers'

jest.mock('@/hooks/useSuperAdminTenants', () => ({
  useSuperAdminTenants: () =>
    require('@/__tests__/helpers/tenantTableHelpers').mockHookState,
}))
jest.mock(
  'next/link',
  () => require('@/__tests__/helpers/tenantTableHelpers').MockLink,
)

describe('TenantManagementTable', () => {
  beforeEach(() => resetHook())

  it('shows "No tenants found." when filter matches nothing', () => {
    resetHook({ tenants: [TENANT_A, TENANT_B] })
    render(<TenantManagementTable />)
    const input = screen.getByRole('textbox', {
      name: /filter tenants/i,
    })
    fireEvent.change(input, { target: { value: 'zzznomatch' } })
    expect(screen.getByText('No tenants found.')).toBeInTheDocument()
  })

  it('clearing the filter restores all rows', () => {
    resetHook({ tenants: [TENANT_A, TENANT_B] })
    render(<TenantManagementTable />)
    const input = screen.getByRole('textbox', {
      name: /filter tenants/i,
    })
    fireEvent.change(input, { target: { value: 'alpha' } })
    fireEvent.change(input, { target: { value: '' } })
    expect(screen.getByTestId('tenant-row-alpha')).toBeInTheDocument()
    expect(screen.getByTestId('tenant-row-beta')).toBeInTheDocument()
  })
})
