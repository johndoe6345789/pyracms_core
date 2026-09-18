import type { LoginRequest } from '@/types'
import { makeMockFormEvent } from './mockFormEvent'

/** Minimal mock user returned by a successful auth response. */
export const MOCK_USER = {
  id: 1,
  username: 'alice',
  email: 'alice@example.com',
  isActive: true,
  isAdmin: false,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
}

/** A pre-filled form that passes validation. */
export const VALID_FORM: LoginRequest = {
  username: 'alice',
  password: 'secret123',
}

/** Fake `e.preventDefault` event object. */
export const fakeEvent = () => makeMockFormEvent().event
