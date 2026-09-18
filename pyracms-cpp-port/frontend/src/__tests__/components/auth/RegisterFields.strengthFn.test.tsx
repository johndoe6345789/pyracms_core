import { passwordStrength, type StrengthScore }
  from '@/components/auth/RegisterFields'

describe('passwordStrength()', () => {
  it('returns 0 for an empty string', () => {
    expect(passwordStrength('')).toBe(0 as StrengthScore)
  })

  it('returns 1 for a short lower-case string', () => {
    // Only lower-case letters, less than 8 chars → 1 point
    expect(passwordStrength('abc')).toBe(1 as StrengthScore)
  })

  it('returns 2 when ≥8 chars but only lowercase', () => {
    // length + lowercase = 2
    expect(passwordStrength('abcdefgh')).toBe(2 as StrengthScore)
  })

  it('returns 3 when ≥8 chars, lowercase, and a digit', () => {
    expect(passwordStrength('abcdefg1')).toBe(3 as StrengthScore)
  })

  it('returns 4 for a fully complex password', () => {
    expect(passwordStrength('Abcdef1!')).toBe(4 as StrengthScore)
  })

  it('counts uppercase as the fourth criterion (needs lower too)', () => {
    // 'abcdef1A' → length + digit + lowercase + uppercase = 4
    expect(passwordStrength('abcdef1A')).toBe(4 as StrengthScore)
  })

  it('returns 3 for all-uppercase with digit (no lowercase)', () => {
    // 'ABCDEF1!' → length + digit + uppercase/special = 3
    // (no lowercase → only 3 points)
    expect(passwordStrength('ABCDEF1!')).toBe(3 as StrengthScore)
  })
})
