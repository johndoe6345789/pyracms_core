import type { RegisterRequest } from '@/types'

/** Minimal valid e-mail pattern used for registration validation. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Validates a {@link RegisterRequest} and returns a human-readable
 * error string, or an empty string when the data is valid.
 *
 * Rules:
 * - `username`  — required, non-blank
 * - `email`     — required, must look like an e-mail address
 * - `password`  — required, minimum 8 characters
 *
 * @param data - The registration form values to validate.
 * @returns A validation error message, or `''` if valid.
 */
export function validateRegisterForm(data: RegisterRequest): string {
  if (!data.username.trim()) {
    return 'Username is required'
  }
  if (!data.email.trim()) {
    return 'Email is required'
  }
  if (!EMAIL_RE.test(data.email)) {
    return 'Invalid email address'
  }
  if (!data.password) {
    return 'Password is required'
  }
  if (data.password.length < 8) {
    return 'Password must be at least 8 characters'
  }
  if (
    data.confirmPassword !== undefined &&
    data.password !== data.confirmPassword
  ) {
    return 'Passwords do not match'
  }
  return ''
}
