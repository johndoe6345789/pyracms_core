export enum UserRole {
  Guest = 0,
  User = 1,
  Moderator = 2,
  SiteAdmin = 3,
  SuperAdmin = 4,
}

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.Guest]: 'Guest',
  [UserRole.User]: 'User',
  [UserRole.Moderator]: 'Moderator',
  [UserRole.SiteAdmin]: 'Site Admin',
  [UserRole.SuperAdmin]: 'Super Admin',
}

export interface User {
  id: number
  username: string
  email: string
  firstName?: string
  lastName?: string
  bio?: string
  avatar?: string
  isActive: boolean
  isAdmin: boolean
  /** Numeric role level (0-4). Falls back to isAdmin if absent. */
  role?: UserRole
  createdAt: string
  updatedAt: string
}

/** Returns effective role, bridging legacy isAdmin boolean. */
export function getUserRole(user: User | null): UserRole {
  if (!user) return UserRole.Guest
  if (user.role !== undefined) return user.role
  return user.isAdmin ? UserRole.SiteAdmin : UserRole.User
}

/**
 * Returns true when the user's effective role is greater than or
 * equal to `minRole`.  Passing `null` is treated as Guest (0).
 *
 * @example
 * hasMinRole(user, UserRole.Moderator) // true if Moderator, SiteAdmin, or SuperAdmin
 */
export function hasMinRole(
  user: User | null,
  minRole: UserRole,
): boolean {
  return getUserRole(user) >= minRole
}

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
  /** Must match password; validated client-side before submission. */
  confirmPassword?: string
  firstName?: string
  lastName?: string
}

export interface AuthResponse {
  success: boolean
  token?: string
  user?: User
  error?: string
}

export interface Tenant {
  id: number
  name: string
  slug: string
  domain?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateTenantRequest {
  name: string
  slug: string
  domain?: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

export interface FlashMessage {
  id: string
  message: string
  severity: 'success' | 'error' | 'warning' | 'info'
  timestamp: number
}
