import { UserRole } from '@/types'

const ASSIGNABLE = [
  UserRole.Guest,
  UserRole.User,
  UserRole.Moderator,
  UserRole.SiteAdmin,
]

/**
 * Roles the actor may hand out: Guest, Normal User and Moderator for an
 * administrator; Administrator too for the platform owner (mirrors the
 * backend's UserAdminRules).
 */
export function grantableRoles(actor: UserRole): UserRole[] {
  if (actor < UserRole.SiteAdmin) return []
  return ASSIGNABLE.filter((r) => r < actor)
}
