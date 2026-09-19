/** validateRegisterForm: password and optional-field rules. */
import { omit } from '@/lib/omit'
import { validateRegisterForm } from '@/hooks/useRegister'
import { VALID_FORM } from '../helpers/useRegisterHelpers'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { post: jest.fn() },
}))

describe('validateRegisterForm', () => {
  it('returns error when password is empty', () => {
    expect(
      validateRegisterForm({
        ...VALID_FORM,
        password: '',
        confirmPassword: '',
      }),
    ).toBe('Password is required')
  })

  it('returns error when password is fewer than 8 chars', () => {
    expect(
      validateRegisterForm({
        ...VALID_FORM,
        password: 'abc12',
        confirmPassword: 'abc12',
      }),
    ).toBe('Password must be at least 8 characters')
  })

  it('accepts a password of exactly 8 characters', () => {
    expect(
      validateRegisterForm({
        ...VALID_FORM,
        password: '12345678',
        confirmPassword: '12345678',
      }),
    ).toBe('')
  })

  it('returns error when confirmPassword does not match', () => {
    expect(
      validateRegisterForm({
        ...VALID_FORM,
        confirmPassword: 'different',
      }),
    ).toBe('Passwords do not match')
  })

  it('does not error when confirmPassword is undefined', () => {
    const noConfirm = omit(VALID_FORM, 'confirmPassword')
    expect(validateRegisterForm(noConfirm)).toBe('')
  })

  it('accepts optional firstName / lastName being absent', () => {
    const minimal = omit(omit(VALID_FORM, 'firstName'), 'lastName')
    expect(validateRegisterForm(minimal)).toBe('')
  })
})
