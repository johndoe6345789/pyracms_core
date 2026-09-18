import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import TenantManagementTable from
  '@/components/super-admin/TenantManagementTable'
import {
  TENANT_A, TENANT_B, resetHook, mockHookState,
} from '@/__tests__/helpers/tenantTable'

jest.mock('@/hooks/useSuperAdminTenants', () => ({
  useSuperAdminTenants: () =>
    require('@/__tests__/helpers/tenantTable').mockHookState,
}))
jest.mock('next/link', () =>
  require('@/__tests__/helpers/mockNextLink').linkMock)

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

  it('delete button triggers handleDelete with correct id', () => {
    resetHook({ tenants: [TENANT_A, TENANT_B] })
    render(<TenantManagementTable />)
    fireEvent.click(screen.getByTestId('delete-tenant-beta'))
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
})
