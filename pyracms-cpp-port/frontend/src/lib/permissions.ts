import { UserRole } from '@/types'

/**
 * The fixed permission defaults, one place. The backend enforces the same
 * table (docs/PERMISSIONS.md); the UI only uses it to hide what would be
 * refused.
 */
export type Capability =
  | 'comment' // comment, react and vote
  | 'post' // forum threads/posts, snippets, own uploads
  | 'writeArticles' // create and publish articles
  | 'moderate' // edit/remove anyone's content, pin/lock/move threads
  | 'manageSite' // the site admin panel
  | 'managePlatform' // sites and accounts across the platform

const MIN_ROLE: Record<Capability, UserRole> = {
  comment: UserRole.User,
  post: UserRole.User,
  writeArticles: UserRole.Moderator,
  moderate: UserRole.Moderator,
  manageSite: UserRole.SiteAdmin,
  managePlatform: UserRole.SuperAdmin,
}

/** The site owner is the site's Administrator whatever role is stored. */
export function effectiveRole(
  role: UserRole | null,
  isOwner: boolean,
): UserRole {
  const base = role ?? UserRole.Guest
  return isOwner && base < UserRole.SiteAdmin ? UserRole.SiteAdmin : base
}

/** `role` null = not signed in on this site (a Guest). */
export function can(
  cap: Capability,
  role: UserRole | null,
  isOwner = false,
): boolean {
  return effectiveRole(role, isOwner) >= MIN_ROLE[cap]
}
