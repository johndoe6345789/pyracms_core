import { grantableRoles } from '@/lib/roles'
import { UserRole } from '@/types'

describe('grantableRoles', () => {
  it('lets a site administrator grant up to Moderator', () => {
    expect(grantableRoles(UserRole.SiteAdmin)).toEqual([
      UserRole.Guest,
      UserRole.User,
      UserRole.Moderator,
    ])
  })

  it('adds Administrator for the platform owner only', () => {
    expect(grantableRoles(UserRole.SuperAdmin)).toEqual([
      UserRole.Guest,
      UserRole.User,
      UserRole.Moderator,
      UserRole.SiteAdmin,
    ])
  })

  it('grants nothing to lower roles', () => {
    expect(grantableRoles(UserRole.Moderator)).toEqual([])
    expect(grantableRoles(UserRole.User)).toEqual([])
  })
})
