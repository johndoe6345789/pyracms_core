

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

  it('values are strictly ordered Guest < User < Moderator '
    + '< SiteAdmin < SuperAdmin', () => {
    expect(UserRole.Guest).toBeLessThan(UserRole.User)
    expect(UserRole.User).toBeLessThan(UserRole.Moderator)
    expect(UserRole.Moderator).toBeLessThan(UserRole.SiteAdmin)
    expect(UserRole.SiteAdmin).toBeLessThan(UserRole.SuperAdmin)
  })
})

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
})
