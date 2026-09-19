/** Tests for TenantManagementTable actions and dialog. */
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'

import TenantManagementTable from
  '@/components/super-admin/TenantManagementTable'
import {
  mockHookState,
  resetHook,
  TENANT_A,
  TENANT_B,
} from '../../helpers/tenantTableHelpers'

jest.mock('@/hooks/useSuperAdminTenants', () => ({
  useSuperAdminTenants: () =>
    require('@/__tests__/helpers/tenantTableHelpers')
      .mockHookState,
}))
jest.mock('next/link', () =>
  require('@/__tests__/helpers/tenantTableHelpers').MockLink)

describe('TenantManagementTable', () => {
  beforeEach(() => resetHook())

  it('delete button triggers handleDelete with correct id', () => {
    resetHook({ tenants: [TENANT_A, TENANT_B] })
    render(<TenantManagementTable />)
    fireEvent.click(
      screen.getByTestId('delete-tenant-beta'),
    )
    expect(mockHookState.handleDelete).toHaveBeenCalledWith(
      TENANT_B.id,
    )
    expect(mockHookState.handleDelete).toHaveBeenCalledTimes(1)
  })

  it('open link points to /site/{slug}', () => {
    resetHook({ tenants: [TENANT_A] })
    render(<TenantManagementTable />)
    const link = screen.getByTestId('open-tenant-alpha')
    expect(link).toHaveAttribute('href', `/site/${TENANT_A.slug}`)
  })

  it('renders TenantDeleteDialog when confirmDeleteId !== null', () => {
    resetHook({ tenants: [TENANT_A], confirmDeleteId: 1 })
    render(<TenantManagementTable />)
    expect(
      screen.getByTestId('tenant-delete-dialog'),
    ).toBeInTheDocument()
  })

  it('does not render delete dialog when confirmDeleteId is null', () => {
    resetHook({ tenants: [TENANT_A], confirmDeleteId: null })
    render(<TenantManagementTable />)
    // Dialog is mounted but hidden; query by role with hidden:true
    const dialog = screen.queryByRole('dialog', { hidden: true })
    // MUI keeps dialog in DOM but marks it hidden when open=false
    if (dialog) {
      expect(dialog).not.toBeVisible()
    } else {
      expect(dialog).toBeNull()
    }
  })

  // -------------------------------------------------------------------------
  // Search / filter bar
  // -------------------------------------------------------------------------
})
