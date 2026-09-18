import { render, screen, within } from '@testing-library/react'
import '@testing-library/jest-dom'
import TenantManagementTable from
  '@/components/super-admin/TenantManagementTable'
import { TENANT_A, resetHook } from '@/__tests__/helpers/tenantTable'

jest.mock('@/hooks/useSuperAdminTenants', () => ({
  useSuperAdminTenants: () =>
    require('@/__tests__/helpers/tenantTable').mockHookState,
}))
jest.mock('next/link', () =>
  require('@/__tests__/helpers/mockNextLink').linkMock)

describe('TenantManagementTable delete dialog', () => {
  beforeEach(() => resetHook())

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

  it('renders all six column headers', () => {
    render(<TenantManagementTable />)
    const table = screen.getByRole('table')
    for (const header of [
      'Name', 'Slug', 'Owner', 'Created', 'Status', 'Actions',
    ]) {
      expect(within(table).getByText(header)).toBeInTheDocument()
    }
  })
})
