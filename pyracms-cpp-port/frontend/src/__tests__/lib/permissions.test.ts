import { can, effectiveRole, type Capability } from '@/lib/permissions'
import { UserRole } from '@/types'

const G = null
const U = UserRole.User
const M = UserRole.Moderator
const A = UserRole.SiteAdmin
const P = UserRole.SuperAdmin

// capability -> [Guest, User, Moderator, Administrator, Platform Owner]
const TABLE: Record<Capability, boolean[]> = {
  comment: [false, true, true, true, true],
  post: [false, true, true, true, true],
  writeArticles: [false, false, true, true, true],
  moderate: [false, false, true, true, true],
  manageSite: [false, false, false, true, true],
  managePlatform: [false, false, false, false, true],
}

describe('permission defaults', () => {
  it.each(Object.entries(TABLE))('%s per level', (cap, expected) => {
    const got = [G, U, M, A, P].map((r) => can(cap as Capability, r))
    expect(got).toEqual(expected)
  })

  it('the site owner is the Administrator of their site', () => {
    expect(effectiveRole(U, true)).toBe(A)
    expect(effectiveRole(G, true)).toBe(A)
    expect(can('manageSite', U, true)).toBe(true)
    expect(can('writeArticles', U, true)).toBe(true)
  })

  it('ownership never grants platform power or lowers a role', () => {
    expect(can('managePlatform', U, true)).toBe(false)
    expect(effectiveRole(P, true)).toBe(P)
  })
})
