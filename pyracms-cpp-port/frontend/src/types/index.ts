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
  createdAt: string
  updatedAt: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
  firstName?: string
  lastName?: string
}

export interface AuthResponse {
  success: boolean
  token?: string
  user?: User
  error?: string
}
