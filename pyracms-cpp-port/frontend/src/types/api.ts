import type { User } from './index'

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
