/** Password strength score: 0 (empty) … 4 (very strong). */
export type StrengthScore = 0 | 1 | 2 | 3 | 4

export const STRENGTH_LABELS: Record<StrengthScore, string> = {
  0: '',
  1: 'Weak',
  2: 'Fair',
  3: 'Good',
  4: 'Strong',
}

export const STRENGTH_COLOURS: Record<StrengthScore, string> = {
  0: 'transparent',
  1: '#d32f2f',
  2: '#f57c00',
  3: '#388e3c',
  4: '#1b5e20',
}

/**
 * Returns a password strength score from 0–4.
 *
 * Scoring criteria (each worth 1 point):
 * - Length ≥ 8
 * - Contains a digit
 * - Contains a lowercase letter
 * - Contains an uppercase letter or special character
 *
 * @param password - Raw password string to evaluate.
 * @returns Strength score between 0 and 4 inclusive.
 */
export function passwordStrength(password: string): StrengthScore {
  if (!password) return 0
  let score = 0
  if (password.length >= 8) score += 1
  if (/\d/.test(password)) score += 1
  if (/[a-z]/.test(password)) score += 1
  if (/[A-Z!@#$%^&*]/.test(password)) score += 1
  return score as StrengthScore
}
