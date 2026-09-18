import React from 'react'
import { render } from '@testing-library/react'
import TenantTableRow from '@/components/super-admin/TenantTableRow'
import type { TenantRow } from '@/hooks/useSuperAdminTenants'

export interface MockHookState {
  tenants: TenantRow[]
  loading: boolean
  confirmDeleteId: number | null
  handleDelete: jest.Mock
  confirmDelete: jest.Mock
  cancelDelete: jest.Mock
  createTenant: jest.Mock
}

export const mockHookState: MockHookState = {
  tenants: [],
  loading: false,
  confirmDeleteId: null,
  handleDelete: jest.fn(),
  confirmDelete: jest.fn(),
  cancelDelete: jest.fn(),
  createTenant: jest.fn(),
}

export const TENANT_A: TenantRow = {
  id: 1, slug: 'alpha', name: 'Alpha Site', owner: 'alice',
  isActive: true, createdAt: '2024-01-01',
}

export const TENANT_B: TenantRow = {
  id: 2, slug: 'beta', name: 'Beta Site', owner: 'bob',
  isActive: false, createdAt: '2024-02-01',
}

/** Resets mock hook state to defaults, then applies overrides. */
export function resetHook(overrides: Partial<MockHookState> = {}) {
  mockHookState.tenants = []
  mockHookState.loading = false
  mockHookState.confirmDeleteId = null
  mockHookState.handleDelete.mockReset()
  mockHookState.confirmDelete.mockReset()
  mockHookState.cancelDelete.mockReset()
  Object.assign(mockHookState, overrides)
}

/** Wraps TenantTableRow in the required table context. */
export function renderRow(
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
