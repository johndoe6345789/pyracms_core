import axios from 'axios'
import { clearToken, currentToken, scopeFromPath } from '@/lib/session'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? ''

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = currentToken()
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
// Only redirect to login for 401s on non-auth endpoints.
// Auth endpoints (login, register, me) handle their own errors.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      const url = error.config?.url || ''
      // Don't redirect for auth-related calls — let them fail gracefully
      const isAuthCall = url.includes('/api/auth/')
      if (!isAuthCall) {
        // Only this scope's session is dropped; other sites stay signed in
        clearToken(scopeFromPath(window.location.pathname))
        // Keep the visitor in the site they were on: accounts are per-site
        const m = window.location.pathname.match(/^\/site\/([^/]+)/)
        window.location.href = m
          ? `/auth/login?tenant=${encodeURIComponent(m[1] ?? '')}`
          : '/auth/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
