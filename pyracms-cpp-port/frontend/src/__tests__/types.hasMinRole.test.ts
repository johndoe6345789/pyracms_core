import { UserRole, hasMinRole } from '@/types/index'
import { makeUser } from './helpers/typesUser'

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
      UserRole.Guest, UserRole.User, UserRole.Moderator,
      UserRole.SiteAdmin, UserRole.SuperAdmin,
    ]
    allRoles.forEach((role) => {
      expect(hasMinRole(user, role)).toBe(true)
    })
  })

  it('returns false for Guest user against every role above Guest', () => {
    const user = makeUser({ role: UserRole.Guest })
    const rolesAboveGuest: UserRole[] = [
      UserRole.User, UserRole.Moderator,
      UserRole.SiteAdmin, UserRole.SuperAdmin,
    ]
    rolesAboveGuest.forEach((role) => {
      expect(hasMinRole(user, role)).toBe(false)
    })
  })
})
