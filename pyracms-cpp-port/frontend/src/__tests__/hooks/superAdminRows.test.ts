import { mapTenantRow, mapUserRow, roleOf } from '@/hooks/superAdminRows'
import { UserRole } from '@/types'

describe('mapTenantRow', () => {
  it('maps a full record', () => {
    expect(mapTenantRow({ id: '3', slug: 's', displayName: 'S',
      ownerUsername: 'o', isActive: false,
      createdAt: '2024-05-06T07:08:09Z' })).toEqual({ id: 3, slug: 's',
      name: 'S', owner: 'o', isActive: false, createdAt: '2024-05-06' })
  })

  it('falls back to slug and defaults', () => {
    expect(mapTenantRow({ id: 1, slug: 'x' })).toEqual({ id: 1, slug: 'x',
      name: 'x', owner: '', isActive: true, createdAt: '' })
    expect(mapTenantRow({ id: 2 })).toMatchObject({ slug: '', name: '' })
  })
})

describe('roleOf and mapUserRow', () => {
  it('prefers the numeric role, then the legacy flag', () => {
    expect(roleOf({ role: '4' })).toBe(UserRole.SuperAdmin)
    expect(roleOf({ role: 0 })).toBe(UserRole.Guest)
    expect(roleOf({ isAdmin: true })).toBe(UserRole.SiteAdmin)
    expect(roleOf({})).toBe(UserRole.User)
  })

  it('maps users with defaults', () => {
    expect(mapUserRow({ id: 1, username: 'u', email: 'e', role: 2,
      createdAt: '2024-01-02T00:00:00Z' })).toMatchObject({
      role: 2, roleLabel: 'Moderator', createdAt: '2024-01-02' })
    expect(mapUserRow({ id: 2 })).toMatchObject({ username: '',
      email: '', isActive: true, createdAt: '' })
  })
})
