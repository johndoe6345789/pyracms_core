import type { GlobalUserRow } from '@/hooks/useSuperAdminUsers'
import { UserRole } from '@/types'

/** Controls what useSuperAdminUsers returns in each test. */
export interface MockHookState {
  users: GlobalUserRow[]
  loading: boolean
  updateRole: jest.Mock
}

export const mockHookState: MockHookState = {
  users: [],
  loading: false,
  updateRole: jest.fn(),
}

/** A fully-populated user fixture for tests. */
export const USER_ALICE: GlobalUserRow = {
  id: 1,
  username: 'alice',
  email: 'alice@example.com',
  role: UserRole.User,
  roleLabel: 'User',
  isActive: true,
  createdAt: '2024-01-15',
}

/** A second user fixture with banned status and moderator role. */
export const USER_BOB: GlobalUserRow = {
  id: 2,
  username: 'bob',
  email: 'bob@example.com',
  role: UserRole.Moderator,
  roleLabel: 'Moderator',
  isActive: false,
  createdAt: '2024-03-10',
}

/** Resets mock state to defaults before each test. */
export function resetHook(overrides: Partial<MockHookState> = {}) {
  mockHookState.users = []
  mockHookState.loading = false
  mockHookState.updateRole.mockReset()
  Object.assign(mockHookState, overrides)
}
