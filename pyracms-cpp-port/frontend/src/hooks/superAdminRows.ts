import { UserRole, USER_ROLE_LABELS } from '@/types'
import { dayOf } from '@/lib/dates'

export interface TenantRow {
  id: number
  slug: string
  name: string
  owner: string
  isActive: boolean
  createdAt: string
}

export interface GlobalUserRow {
  id: number
  username: string
  email: string
  role: UserRole
  roleLabel: string
  isActive: boolean
  createdAt: string
}

type Raw = Record<string, unknown>

const day = dayOf

/** Maps an API tenant record to a table row. */
export function mapTenantRow(t: Raw): TenantRow {
  return {
    id: Number(t.id),
    slug: String(t.slug || ''),
    name: String(t.displayName || t.slug || ''),
    owner: String(t.ownerUsername || ''),
    isActive: Boolean(t.isActive ?? true),
    createdAt: day(t.createdAt),
  }
}

/** Numeric role, falling back to the legacy isAdmin flag. */
export function roleOf(u: Raw): UserRole {
  if (u.role !== undefined) return Number(u.role) as UserRole
  return u.isAdmin ? UserRole.SiteAdmin : UserRole.User
}

/** Maps an API user record to a table row. */
export function mapUserRow(u: Raw): GlobalUserRow {
  const role = roleOf(u)
  return {
    id: Number(u.id),
    username: String(u.username || ''),
    email: String(u.email || ''),
    role,
    roleLabel: USER_ROLE_LABELS[role],
    // The API reports `banned` (admins only); older shapes used isActive
    isActive: u.banned !== undefined ? !u.banned : Boolean(u.isActive ?? true),
    createdAt: day(u.createdAt),
  }
}
