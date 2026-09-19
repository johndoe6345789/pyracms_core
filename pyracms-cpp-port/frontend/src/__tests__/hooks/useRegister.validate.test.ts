/** validateRegisterForm: username, email and shape rules. */
import { validateRegisterForm } from '@/hooks/useRegister'
import { VALID_FORM } from '../helpers/useRegisterHelpers'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { post: jest.fn() },
}))

describe('validateRegisterForm', () => {
  it('returns empty string for valid data', () => {
    expect(validateRegisterForm(VALID_FORM)).toBe('')
  })

  it('returns error when username is blank', () => {
    expect(validateRegisterForm({ ...VALID_FORM, username: '' })).toBe(
      'Username is required',
    )
  })

  it('returns error when username is whitespace only', () => {
    expect(
      validateRegisterForm({
        ...VALID_FORM,
        username: '   ',
      }),
    ).toBe('Username is required')
  })

  it('returns error when email is blank', () => {
    expect(validateRegisterForm({ ...VALID_FORM, email: '' })).toBe(
      'Email is required',
    )
  })

  it('returns error when email has no @ symbol', () => {
    expect(
      validateRegisterForm({
        ...VALID_FORM,
        email: 'notanemail',
      }),
    ).toBe('Invalid email address')
  })

  it('returns error when email has no domain part', () => {
    expect(validateRegisterForm({ ...VALID_FORM, email: 'a@b' })).toBe(
      'Invalid email address',
    )
  })
})
