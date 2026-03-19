/**
 * Tests for TenantManagementTable and TenantTableRow.
 *
 * TenantTableRow is a pure presentational component that is
 * exercised through TenantManagementTable; dedicated cases for its
 * individual behaviour are grouped in the second describe block so
 * the same render call is not duplicated unnecessarily.
 */
import React from 'react'
import {
  render,
  screen,
  fireEvent,
  within,
} from '@testing-library/react'
import '@testing-library/jest-dom'

import TenantManagementTable from
  '@/components/super-admin/TenantManagementTable'
import TenantTableRow from
  '@/components/super-admin/TenantTableRow'
import type { TenantRow } from
  '@/hooks/useSuperAdminTenants'

// ---------------------------------------------------------------------------
// Hook mock
// ---------------------------------------------------------------------------

/** Shape returned by useSuperAdminTenants that the tests control. */
interface MockHookState {
  tenants: TenantRow[]
  loading: boolean
  confirmDeleteId: number | null
  handleDelete: jest.Mock
  confirmDelete: jest.Mock
  cancelDelete: jest.Mock
  createTenant: jest.Mock
}

const mockHookState: MockHookState = {
  tenants: [],
  loading: false,
  confirmDeleteId: null,
  handleDelete: jest.fn(),
  confirmDelete: jest.fn(),
  cancelDelete: jest.fn(),
  createTenant: jest.fn(),
}

jest.mock('@/hooks/useSuperAdminTenants', () => ({
  useSuperAdminTenants: () => mockHookState,
}))

// next/link renders a plain <a> in the test environment.
jest.mock('next/link', () => {
  const MockLink = ({
    href,
    children,
    ...rest
  }: {
    href: string
    children: React.ReactNode
    [key: string]: unknown
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  )
  MockLink.displayName = 'MockLink'
  return MockLink
})

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

/** Two tenant fixtures used across multiple test cases. */
const TENANT_A: TenantRow = {
  id: 1,
  slug: 'alpha',
  name: 'Alpha Site',
  owner: 'alice',
  isActive: true,
  createdAt: '2024-01-01',
}

const TENANT_B: TenantRow = {
  id: 2,
  slug: 'beta',
  name: 'Beta Site',
  owner: 'bob',
  isActive: false,
  createdAt: '2024-02-01',
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Resets mock hook state to sensible defaults before every test. */
function resetHook(overrides: Partial<MockHookState> = {}) {
  mockHookState.tenants = []
  mockHookState.loading = false
  mockHookState.confirmDeleteId = null
  mockHookState.handleDelete.mockReset()
  mockHookState.confirmDelete.mockReset()
  mockHookState.cancelDelete.mockReset()
  Object.assign(mockHookState, overrides)
}

// ---------------------------------------------------------------------------
// TenantManagementTable
// ---------------------------------------------------------------------------

describe('TenantManagementTable', () => {
  beforeEach(() => resetHook())

  it('shows CircularProgress when loading is true', () => {
    resetHook({ loading: true })
    render(<TenantManagementTable />)
    expect(
      screen.getByRole('progressbar'),
    ).toBeInTheDocument()
    expect(
      screen.queryByTestId('tenant-management-table'),
    ).not.toBeInTheDocument()
  })

  it('shows "No tenants found." when tenants array is empty', () => {
    render(<TenantManagementTable />)
    expect(
      screen.getByText('No tenants found.'),
    ).toBeInTheDocument()
  })

  it('renders one row per tenant', () => {
    resetHook({ tenants: [TENANT_A, TENANT_B] })
    render(<TenantManagementTable />)
    expect(
      screen.getByTestId('tenant-row-alpha'),
    ).toBeInTheDocument()
    expect(
      screen.getByTestId('tenant-row-beta'),
    ).toBeInTheDocument()
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

  it('renders the filter input', () => {
    render(<TenantManagementTable />)
    expect(
      screen.getByTestId('tenant-filter-input'),
    ).toBeInTheDocument()
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
    expect(
      screen.getByTestId('tenant-row-alpha'),
    ).toBeInTheDocument()
    expect(
      screen.queryByTestId('tenant-row-beta'),
    ).not.toBeInTheDocument()
  })

  it('filter is case-insensitive', () => {
    resetHook({ tenants: [TENANT_A, TENANT_B] })
    render(<TenantManagementTable />)
    const input = screen.getByRole('textbox', {
      name: /filter tenants/i,
    })
    fireEvent.change(input, { target: { value: 'ALPHA' } })
    expect(
      screen.getByTestId('tenant-row-alpha'),
    ).toBeInTheDocument()
    expect(
      screen.queryByTestId('tenant-row-beta'),
    ).not.toBeInTheDocument()
  })

  it('shows "No tenants found." when filter matches nothing', () => {
    resetHook({ tenants: [TENANT_A, TENANT_B] })
    render(<TenantManagementTable />)
    const input = screen.getByRole('textbox', {
      name: /filter tenants/i,
    })
    fireEvent.change(input, { target: { value: 'zzznomatch' } })
    expect(
      screen.getByText('No tenants found.'),
    ).toBeInTheDocument()
  })

  it('clearing the filter restores all rows', () => {
    resetHook({ tenants: [TENANT_A, TENANT_B] })
    render(<TenantManagementTable />)
    const input = screen.getByRole('textbox', {
      name: /filter tenants/i,
    })
    fireEvent.change(input, { target: { value: 'alpha' } })
    fireEvent.change(input, { target: { value: '' } })
    expect(
      screen.getByTestId('tenant-row-alpha'),
    ).toBeInTheDocument()
    expect(
      screen.getByTestId('tenant-row-beta'),
    ).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// TenantTableRow (standalone)
// ---------------------------------------------------------------------------

describe('TenantTableRow', () => {
  /** Wraps TenantTableRow in the required table context. */
  function renderRow(
    tenant: TenantRow,
    onDelete: jest.Mock = jest.fn(),
  ) {
    return render(
      <table>
        <tbody>
          <TenantTableRow tenant={tenant} onDelete={onDelete} />
        </tbody>
      </table>,
    )
  }

  it('renders name, slug, owner and createdAt', () => {
    renderRow(TENANT_A)
    expect(screen.getByText(TENANT_A.name)).toBeInTheDocument()
    expect(screen.getByText(TENANT_A.slug)).toBeInTheDocument()
    expect(screen.getByText(TENANT_A.owner)).toBeInTheDocument()
    expect(
      screen.getByText(TENANT_A.createdAt),
    ).toBeInTheDocument()
  })

  it('active chip shows "Active" with success color', () => {
    renderRow(TENANT_A) // isActive: true
    const chip = screen.getByText('Active')
    expect(chip).toBeInTheDocument()
    // MUI renders color as a class; check the parent element
    expect(chip.closest('.MuiChip-root')).toHaveClass(
      'MuiChip-colorSuccess',
    )
  })

  it('inactive chip shows "Inactive" with default color', () => {
    renderRow(TENANT_B) // isActive: false
    const chip = screen.getByText('Inactive')
    expect(chip).toBeInTheDocument()
    expect(chip.closest('.MuiChip-root')).not.toHaveClass(
      'MuiChip-colorSuccess',
    )
  })

  it('open icon button has correct aria-label and href', () => {
    renderRow(TENANT_A)
    const btn = screen.getByTestId('open-tenant-alpha')
    expect(btn).toHaveAttribute(
      'aria-label',
      `Open ${TENANT_A.name}`,
    )
    expect(btn).toHaveAttribute('href', `/site/${TENANT_A.slug}`)
  })

  it('delete icon button calls onDelete with tenant id', () => {
    const onDelete = jest.fn()
    renderRow(TENANT_A, onDelete)
    fireEvent.click(
      screen.getByTestId('delete-tenant-alpha'),
    )
    expect(onDelete).toHaveBeenCalledWith(TENANT_A.id)
    expect(onDelete).toHaveBeenCalledTimes(1)
  })

  it('row has data-testid="tenant-row-{slug}"', () => {
    renderRow(TENANT_A)
    const row = screen.getByTestId(`tenant-row-${TENANT_A.slug}`)
    // Must be a table row element
    expect(row.tagName.toLowerCase()).toBe('tr')
  })

  it('row data-testid uses the slug, not the name', () => {
    const custom: TenantRow = {
      ...TENANT_A,
      slug: 'custom-slug',
      name: 'Different Name',
    }
    renderRow(custom)
    expect(
      screen.getByTestId('tenant-row-custom-slug'),
    ).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Integration: within helper verifies column placement
// ---------------------------------------------------------------------------

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
