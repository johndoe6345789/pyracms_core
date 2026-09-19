import React from 'react'
import type { TenantRow } from '@/hooks/useSuperAdminTenants'

/** Shape returned by useSuperAdminTenants that tests control. */
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

// next/link renders a plain <a> in the test environment.
export const MockLink = ({
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

export const TENANT_A: TenantRow = {
  id: 1,
  slug: 'alpha',
  name: 'Alpha Site',
  owner: 'alice',
  isActive: true,
  createdAt: '2024-01-01',
}

export const TENANT_B: TenantRow = {
  id: 2,
  slug: 'beta',
  name: 'Beta Site',
  owner: 'bob',
  isActive: false,
  createdAt: '2024-02-01',
}

/** Resets mock hook state to defaults before every test. */
export function resetHook(overrides: Partial<MockHookState> = {}) {
  mockHookState.tenants = []
  mockHookState.loading = false
  mockHookState.confirmDeleteId = null
  mockHookState.handleDelete.mockReset()
  mockHookState.confirmDelete.mockReset()
  mockHookState.cancelDelete.mockReset()
  Object.assign(mockHookState, overrides)
}
