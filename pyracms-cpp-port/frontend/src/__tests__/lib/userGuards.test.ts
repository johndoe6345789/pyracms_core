import { UserRole } from '@/types'
import { grantable, guardUser, type Actor } from '@/lib/userGuards'
import type { UserRow } from '@/hooks/admin/userRow'

const row = (over: Partial<UserRow> = {}): UserRow => ({
  id: 2,
  username: 't',
  fullName: '',
  email: '',
  created: '',
  banned: false,
  role: UserRole.User,
  ...over,
})
const admin: Actor = { id: 1, role: UserRole.SiteAdmin }
const top: Actor = { id: 9, role: UserRole.SuperAdmin }

it('allows an administrator to act on a lower level', () => {
  expect(guardUser(admin, row())).toEqual({ ban: null, del: null, role: null })
})

it('refuses everything without the Administrator role', () => {
  const g = guardUser({ id: 1, role: UserRole.Moderator }, row())
  expect(g.ban).toMatch(/Administrator role required/)
  expect(g.role).toMatch(/Administrator role required/)
})

it('refuses to change your own account', () => {
  const g = guardUser(admin, row({ id: 1 }))
  expect(g.ban).toMatch(/your own account/)
  expect(g.del).toMatch(/your own account/)
  expect(g.role).toMatch(/your own account/)
})

it('refuses equal or higher levels but not for a Platform Owner', () => {
  const same = row({ role: UserRole.SiteAdmin })
  expect(guardUser(admin, same).del).toMatch(/equal or higher/)
  expect(guardUser(admin, row({ role: 4 })).role).toMatch(/equal or higher/)
  expect(guardUser(top, same).del).toBeNull()
})

it('protects the site owner from anyone but a Platform Owner', () => {
  const owner = row({ siteOwner: true, role: UserRole.User })
  expect(guardUser(admin, owner).ban).toMatch(/site owner/)
  expect(guardUser(admin, owner).role).toMatch(/site owner/)
  expect(guardUser(top, owner).ban).toBeNull()
})

it('protects the last administrator from ban, delete and demotion', () => {
  const last = row({ lastAdmin: true, role: UserRole.SiteAdmin })
  const g = guardUser(top, last)
  expect(g.ban).toMatch(/last administrator/)
  expect(g.del).toMatch(/last administrator/)
  expect(g.role).toBeNull() // still editable; options stay pinned
})

it('treats the site owner as an Administrator', () => {
  const owner: Actor = { id: 1, role: UserRole.User, owner: true }
  expect(guardUser(owner, row()).del).toBeNull()
  expect(grantable(owner)).toEqual([0, 1, 2, 3])
})

it('limits what may be granted', () => {
  expect(grantable(admin)).toEqual([0, 1, 2])
  expect(grantable(top)).toEqual([0, 1, 2, 3])
  expect(grantable({ id: 1, role: UserRole.Moderator })).toEqual([])
})
