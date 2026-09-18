import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import TenantManagementTable from
  '@/components/super-admin/TenantManagementTable'
import {
  TENANT_A, TENANT_B, resetHook,
} from '@/__tests__/helpers/tenantTable'

jest.mock('@/hooks/useSuperAdminTenants', () => ({
  useSuperAdminTenants: () =>
    require('@/__tests__/helpers/tenantTable').mockHookState,
}))
jest.mock('next/link', () =>
  require('@/__tests__/helpers/mockNextLink').linkMock)

const getInput = () =>
  screen.getByRole('textbox', { name: /filter tenants/i })

function setup() {
  resetHook({ tenants: [TENANT_A, TENANT_B] })
  render(<TenantManagementTable />)
  return getInput()
}

const change = (el: HTMLElement, value: string) =>
  fireEvent.change(el, { target: { value } })

describe('TenantManagementTable filter', () => {
  beforeEach(() => resetHook())

  it('renders the filter input', () => {
    render(<TenantManagementTable />)
    expect(
      screen.getByTestId('tenant-filter-input'),
    ).toBeInTheDocument()
  })

  it('filter input has aria-label "Filter tenants"', () => {
    render(<TenantManagementTable />)
    expect(getInput()).toBeInTheDocument()
  })

  it('filters rows by name (case-insensitive)', () => {
    change(setup(), 'alpha')
    expect(screen.getByTestId('tenant-row-alpha')).toBeInTheDocument()
    expect(
      screen.queryByTestId('tenant-row-beta'),
    ).not.toBeInTheDocument()
  })

  it('filter is case-insensitive', () => {
    change(setup(), 'ALPHA')
    expect(screen.getByTestId('tenant-row-alpha')).toBeInTheDocument()
    expect(
      screen.queryByTestId('tenant-row-beta'),
    ).not.toBeInTheDocument()
  })

  it('shows "No tenants found." when filter matches nothing', () => {
    change(setup(), 'zzznomatch')
    expect(screen.getByText('No tenants found.')).toBeInTheDocument()
  })

  it('clearing the filter restores all rows', () => {
    const input = setup()
    change(input, 'alpha')
    change(input, '')
    expect(screen.getByTestId('tenant-row-alpha')).toBeInTheDocument()
    expect(screen.getByTestId('tenant-row-beta')).toBeInTheDocument()
  })
})
