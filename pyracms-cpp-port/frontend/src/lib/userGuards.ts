import { UserRole } from '@/types'
import type { UserRow } from '@/hooks/admin/userRow'

/** The signed-in account; `owner` = owns the site being administered. */
export interface Actor {
  id: number
  role: UserRole
  owner?: boolean
}

/** Why an action is refused (null = allowed). Mirrors UserAdminRules. */
export interface UserGuard {
  ban: string | null
  del: string | null
  role: string | null
}

const OPEN: UserGuard = { ban: null, del: null, role: null }
const all = (why: string): UserGuard => ({ ban: why, del: why, role: why })

/** An owner acts as an Administrator on their own site. */
export function effectiveRole(a: Actor): UserRole {
  return a.owner ? Math.max(a.role, UserRole.SiteAdmin) : a.role
}

/** Roles the account may hand out (Platform Owner is never granted). */
export function grantable(a: Actor): UserRole[] {
  const top = a.owner ? UserRole.SiteAdmin : effectiveRole(a) - 1
  const max = Math.min(top, UserRole.SiteAdmin)
  return [0, 1, 2, 3].filter((r) => r <= max && effectiveRole(a) >= 3)
}

/** Which of ban / delete / level change the backend would refuse. */
export function guardUser(actor: Actor, target: UserRow): UserGuard {
  const role = effectiveRole(actor)
  const top = role >= UserRole.SuperAdmin
  if (role < UserRole.SiteAdmin) return all('Administrator role required')
  if (actor.id === target.id) return all('You cannot change your own account')
  if (target.siteOwner && !top) return all('The site owner cannot be changed')
  if (!top && target.role >= role)
    return all('Account has an equal or higher level')
  if (target.lastAdmin) {
    const why = 'This is the last administrator of the site'
    return { ban: why, del: why, role: null }
  }
  return OPEN
}
