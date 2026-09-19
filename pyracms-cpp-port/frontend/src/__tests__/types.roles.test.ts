import { UserRole, USER_ROLE_LABELS } from '@/types/index'

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
  it(
    'values are strictly ordered ' +
      'Guest < User < Moderator < SiteAdmin < SuperAdmin',
    () => {
      expect(UserRole.Guest).toBeLessThan(UserRole.User)
      expect(UserRole.User).toBeLessThan(UserRole.Moderator)
      expect(UserRole.Moderator).toBeLessThan(UserRole.SiteAdmin)
      expect(UserRole.SiteAdmin).toBeLessThan(UserRole.SuperAdmin)
    },
  )
})

describe('USER_ROLE_LABELS', () => {
  it('maps Guest to "Guest"', () => {
    expect(USER_ROLE_LABELS[UserRole.Guest]).toBe('Guest')
  })
  it('maps User to "User"', () => {
    expect(USER_ROLE_LABELS[UserRole.User]).toBe('Normal User')
  })
  it('maps Moderator to "Moderator"', () => {
    expect(USER_ROLE_LABELS[UserRole.Moderator]).toBe('Moderator')
  })
  it('maps SiteAdmin to "Administrator"', () => {
    expect(USER_ROLE_LABELS[UserRole.SiteAdmin]).toBe('Administrator')
  })
  it('maps SuperAdmin to "Platform Owner"', () => {
    expect(USER_ROLE_LABELS[UserRole.SuperAdmin]).toBe('Platform Owner')
  })
  it('contains exactly 5 entries — one per role', () => {
    const keys = Object.keys(USER_ROLE_LABELS)
    expect(keys).toHaveLength(5)
  })
})
