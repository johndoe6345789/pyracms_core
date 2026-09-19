/**
 * Tests for GlobalUsersTable.
 *
 * The hook useSuperAdminUsers is mocked so the component can be
 * exercised without a real API layer.
 */
import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

import GlobalUsersTable from
  '@/components/super-admin/GlobalUsersTable'
import type { GlobalUserRow } from
  '@/hooks/useSuperAdminUsers'
import { UserRole } from '@/types'

// ---------------------------------------------------------------------------
// Hook mock
// ---------------------------------------------------------------------------

/** Controls what useSuperAdminUsers returns in each test. */
interface MockHookState {
  users: GlobalUserRow[]
  loading: boolean
  updateRole: jest.Mock
}

const mockHookState: MockHookState = {
  users: [],
  loading: false,
  updateRole: jest.fn(),
}

jest.mock('@/hooks/useSuperAdminUsers', () => ({
  useSuperAdminUsers: () => mockHookState,
}))

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

/** A fully-populated user fixture for tests. */
const USER_ALICE: GlobalUserRow = {
  id: 1,
  username: 'alice',
  email: 'alice@example.com',
  role: UserRole.User,
  roleLabel: 'User',
  isActive: true,
  createdAt: '2024-01-15',
}

/** A second user fixture with banned status and moderator role. */
const USER_BOB: GlobalUserRow = {
  id: 2,
  username: 'bob',
  email: 'bob@example.com',
  role: UserRole.Moderator,
  roleLabel: 'Moderator',
  isActive: false,
  createdAt: '2024-03-10',
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Resets mock state to defaults before each test. */
function resetHook(overrides: Partial<MockHookState> = {}) {
  mockHookState.users = []
  mockHookState.loading = false
  mockHookState.updateRole.mockReset()
  Object.assign(mockHookState, overrides)
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('GlobalUsersTable', () => {
  beforeEach(() => resetHook())

  it('shows CircularProgress when loading is true', () => {
    resetHook({ loading: true })
    render(<GlobalUsersTable />)
    expect(
      screen.getByRole('progressbar'),
    ).toBeInTheDocument()
    expect(
      screen.queryByTestId('global-users-table'),
    ).not.toBeInTheDocument()
  })

  it('shows "No users found." when users array is empty', () => {
    render(<GlobalUsersTable />)
    expect(
      screen.getByText('No users found.'),
    ).toBeInTheDocument()
  })

  it('renders one table row per user', () => {
    resetHook({ users: [USER_ALICE, USER_BOB] })
    render(<GlobalUsersTable />)
    expect(
      screen.getByTestId('user-row-alice'),
    ).toBeInTheDocument()
    expect(
      screen.getByTestId('user-row-bob'),
    ).toBeInTheDocument()
  })

  it('each row has data-testid="user-row-{username}"', () => {
    resetHook({ users: [USER_ALICE] })
    render(<GlobalUsersTable />)
    expect(
      screen.getByTestId(`user-row-${USER_ALICE.username}`),
    ).toBeInTheDocument()
  })

  it('row data-testid is a <tr> element', () => {
    resetHook({ users: [USER_ALICE] })
    render(<GlobalUsersTable />)
    const row = screen.getByTestId('user-row-alice')
    expect(row.tagName.toLowerCase()).toBe('tr')
  })

  it('renders username and email for each user', () => {
    resetHook({ users: [USER_ALICE] })
    render(<GlobalUsersTable />)
    expect(
      screen.getByText(USER_ALICE.username),
    ).toBeInTheDocument()
    expect(
      screen.getByText(USER_ALICE.email),
    ).toBeInTheDocument()
  })

  it('renders createdAt date for each user', () => {
    resetHook({ users: [USER_ALICE] })
    render(<GlobalUsersTable />)
    expect(
      screen.getByText(USER_ALICE.createdAt),
    ).toBeInTheDocument()
  })

  it('active user has "Active" chip', () => {
    resetHook({ users: [USER_ALICE] })
    render(<GlobalUsersTable />)
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('inactive user has "Banned" chip', () => {
    resetHook({ users: [USER_BOB] })
    render(<GlobalUsersTable />)
    expect(screen.getByText('Banned')).toBeInTheDocument()
  })

  it('table wrapper has data-testid="global-users-table"', () => {
    render(<GlobalUsersTable />)
    expect(
      screen.getByTestId('global-users-table'),
    ).toBeInTheDocument()
  })

  it('renders the role select cell for each user', () => {
    resetHook({ users: [USER_ALICE] })
    render(<GlobalUsersTable />)
    expect(
      screen.getByTestId(`role-select-${USER_ALICE.username}`),
    ).toBeInTheDocument()
  })

  it('renders column headers', () => {
    render(<GlobalUsersTable />)
    for (const header of [
      'Username', 'Email', 'Role', 'Status', 'Joined',
    ]) {
      expect(screen.getByText(header)).toBeInTheDocument()
    }
  })
})
