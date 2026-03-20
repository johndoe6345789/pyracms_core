/**
 * Unit tests for src/types/index.ts
 *
 * Coverage targets:
 *   - UserRole enum values
 *   - USER_ROLE_LABELS mapping
 *   - getUserRole() all code paths
 *   - hasMinRole() boundary conditions
 */

import {
  UserRole,
  USER_ROLE_LABELS,
  getUserRole,
  hasMinRole,
  type User,
} from '@/types/index'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a minimal valid User, overriding only the fields under test. */
function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    isActive: true,
    isAdmin: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    ...overrides,
  }
}

// ---------------------------------------------------------------------------
// UserRole enum
// ---------------------------------------------------------------------------

describe('UserRole enum', () => {
  it('Guest has numeric value 0', () => {
    expect(UserRole.Guest).toBe(0)
  })

  it('User has numeric value 1', () => {
    expect(UserRole.User).toBe(1)
  })

  it('Moderator has numeric value 2', () => {
    expect(UserRole.Moderator).toBe(2)
  })

  it('SiteAdmin has numeric value 3', () => {
    expect(UserRole.SiteAdmin).toBe(3)
  })

  it('SuperAdmin has numeric value 4', () => {
    expect(UserRole.SuperAdmin).toBe(4)
  })

  it('values are strictly ordered Guest < User < Moderator < SiteAdmin < SuperAdmin', () => {
    expect(UserRole.Guest).toBeLessThan(UserRole.User)
    expect(UserRole.User).toBeLessThan(UserRole.Moderator)
    expect(UserRole.Moderator).toBeLessThan(UserRole.SiteAdmin)
    expect(UserRole.SiteAdmin).toBeLessThan(UserRole.SuperAdmin)
  })
})

// ---------------------------------------------------------------------------
// USER_ROLE_LABELS
// ---------------------------------------------------------------------------

describe('USER_ROLE_LABELS', () => {
  it('maps Guest to "Guest"', () => {
    expect(USER_ROLE_LABELS[UserRole.Guest]).toBe('Guest')
  })

  it('maps User to "User"', () => {
    expect(USER_ROLE_LABELS[UserRole.User]).toBe('User')
  })

  it('maps Moderator to "Moderator"', () => {
    expect(USER_ROLE_LABELS[UserRole.Moderator]).toBe('Moderator')
  })

  it('maps SiteAdmin to "Site Admin"', () => {
    expect(USER_ROLE_LABELS[UserRole.SiteAdmin]).toBe('Site Admin')
  })

  it('maps SuperAdmin to "Super Admin"', () => {
    expect(USER_ROLE_LABELS[UserRole.SuperAdmin]).toBe('Super Admin')
  })

  it('contains exactly 5 entries — one per role', () => {
    const keys = Object.keys(USER_ROLE_LABELS)
    expect(keys).toHaveLength(5)
  })
})

// ---------------------------------------------------------------------------
// getUserRole
// ---------------------------------------------------------------------------

describe('getUserRole', () => {
  it('returns Guest when user is null', () => {
    expect(getUserRole(null)).toBe(UserRole.Guest)
  })

  it('returns the role field when it is explicitly set', () => {
    const user = makeUser({ role: UserRole.Moderator, isAdmin: false })
    expect(getUserRole(user)).toBe(UserRole.Moderator)
  })

  it('returns SiteAdmin via isAdmin=true when role field is absent', () => {
    const user = makeUser({ isAdmin: true })
    // role is intentionally omitted — makeUser does not set it
    expect(getUserRole(user)).toBe(UserRole.SiteAdmin)
  })

  it('returns User via isAdmin=false when role field is absent', () => {
    const user = makeUser({ isAdmin: false })
    expect(getUserRole(user)).toBe(UserRole.User)
  })

  it('role field takes precedence over isAdmin=true (role=Guest wins)', () => {
    const user = makeUser({ role: UserRole.Guest, isAdmin: true })
    expect(getUserRole(user)).toBe(UserRole.Guest)
  })

  it('role field takes precedence over isAdmin=true (role=User wins)', () => {
    const user = makeUser({ role: UserRole.User, isAdmin: true })
    expect(getUserRole(user)).toBe(UserRole.User)
  })

  it('returns SuperAdmin when role field is explicitly SuperAdmin', () => {
    const user = makeUser({ role: UserRole.SuperAdmin })
    expect(getUserRole(user)).toBe(UserRole.SuperAdmin)
  })
})

// ---------------------------------------------------------------------------
// hasMinRole
// ---------------------------------------------------------------------------

describe('hasMinRole', () => {
  it('returns false for null user when minRole is User', () => {
    expect(hasMinRole(null, UserRole.User)).toBe(false)
  })

  it('returns true for null user when minRole is Guest', () => {
    expect(hasMinRole(null, UserRole.Guest)).toBe(true)
  })

  it('returns true when effective role equals minRole exactly', () => {
    const user = makeUser({ role: UserRole.Moderator })
    expect(hasMinRole(user, UserRole.Moderator)).toBe(true)
  })

  it('returns true when effective role exceeds minRole', () => {
    const user = makeUser({ role: UserRole.SuperAdmin })
    expect(hasMinRole(user, UserRole.Moderator)).toBe(true)
  })

  it('returns false when effective role is below minRole', () => {
    const user = makeUser({ role: UserRole.User })
    expect(hasMinRole(user, UserRole.Moderator)).toBe(false)
  })

  it('returns true for SiteAdmin user meeting SiteAdmin requirement', () => {
    const user = makeUser({ isAdmin: true })
    expect(hasMinRole(user, UserRole.SiteAdmin)).toBe(true)
  })

  it('returns false for regular User against SiteAdmin requirement', () => {
    const user = makeUser({ isAdmin: false })
    expect(hasMinRole(user, UserRole.SiteAdmin)).toBe(false)
  })

  it('returns true for SuperAdmin against every role level', () => {
    const user = makeUser({ role: UserRole.SuperAdmin })
    const allRoles: UserRole[] = [
      UserRole.Guest,
      UserRole.User,
      UserRole.Moderator,
      UserRole.SiteAdmin,
      UserRole.SuperAdmin,
    ]
    allRoles.forEach((role) => {
      expect(hasMinRole(user, role)).toBe(true)
    })
  })

  it('returns false for Guest user against every role above Guest', () => {
    const user = makeUser({ role: UserRole.Guest })
    const rolesAboveGuest: UserRole[] = [
      UserRole.User,
      UserRole.Moderator,
      UserRole.SiteAdmin,
      UserRole.SuperAdmin,
    ]
    rolesAboveGuest.forEach((role) => {
      expect(hasMinRole(user, role)).toBe(false)
    })
  })
})
