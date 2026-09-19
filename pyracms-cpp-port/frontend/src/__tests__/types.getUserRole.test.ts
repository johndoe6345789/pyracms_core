import { UserRole, getUserRole } from '@/types/index'
import { makeUser } from './helpers/typesUser'

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
