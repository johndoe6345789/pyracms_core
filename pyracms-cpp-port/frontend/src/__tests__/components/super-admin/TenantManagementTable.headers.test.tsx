/** Tests for TenantManagementTable column headers. */
import React from 'react'
import { render, screen, within } from '@testing-library/react'
import '@testing-library/jest-dom'

import TenantManagementTable from
  '@/components/super-admin/TenantManagementTable'
import { resetHook } from '../../helpers/tenantTableHelpers'

jest.mock('@/hooks/useSuperAdminTenants', () => ({
  useSuperAdminTenants: () =>
    require('@/__tests__/helpers/tenantTableHelpers')
      .mockHookState,
}))
jest.mock('next/link', () =>
  require('@/__tests__/helpers/tenantTableHelpers').MockLink)

describe('TenantManagementTable column headers', () => {
  beforeEach(() => resetHook())

  it('renders all six column headers', () => {
    render(<TenantManagementTable />)
    const table = screen.getByRole('table')
    for (const header of [
      'Name', 'Slug', 'Owner', 'Created', 'Status', 'Actions',
    ]) {
      expect(
        within(table).getByText(header),
      ).toBeInTheDocument()
    }
  })
})
