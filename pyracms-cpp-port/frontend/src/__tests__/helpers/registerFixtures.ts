import type { useRegister } from '@/hooks/useRegister'
import type { RegisterRequest } from '@/types'
import { makeMockFormEvent } from './mockFormEvent'

/** Minimal mock user returned by a successful auth response. */
export const MOCK_USER = {
  id: 2,
  username: 'bob',
  email: 'bob@example.com',
  isActive: true,
  isAdmin: false,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
}

/** A pre-filled form that passes all validation rules. */
export const VALID_FORM: Required<RegisterRequest> = {
  username: 'bob',
  email: 'bob@example.com',
  password: 'secret99',
  confirmPassword: 'secret99',
  firstName: 'Bob',
  lastName: 'Smith',
}

/**
 * Fills every field in VALID_FORM (plus any overrides) via
 * updateField so the form passes validation before submission.
 */
export function fillValidForm(
  result: { current: ReturnType<typeof useRegister> },
  overrides: Partial<RegisterRequest> = {},
): void {
  const form = { ...VALID_FORM, ...overrides }
  Object.entries(form).forEach(([k, v]) => {
    if (v !== undefined) {
      result.current.updateField(
        k as keyof RegisterRequest,
        v,
      )
    }
  })
}

/** Fake e.preventDefault event object. */
export const fakeEvent = () => makeMockFormEvent().event
