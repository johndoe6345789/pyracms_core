import { validateLoginForm } from '@/hooks/useLogin'
import { VALID_FORM, renderLogin } from '../helpers/loginHookHelpers'

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}))

describe('validateLoginForm', () => {
  it('returns empty string for valid data', () => {
    expect(validateLoginForm(VALID_FORM)).toBe('')
  })

  it('returns error when username is blank', () => {
    expect(validateLoginForm({ username: '  ', password: 'x' })).toBe(
      'Username is required',
    )
  })

  it('returns error when username is empty string', () => {
    expect(validateLoginForm({ username: '', password: 'x' })).toBe(
      'Username is required',
    )
  })

  it('returns error when password is empty', () => {
    expect(validateLoginForm({ username: 'alice', password: '' })).toBe(
      'Password is required',
    )
  })
})

describe('useLogin', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  it('returns empty formData on mount', () => {
    const { result } = renderLogin()
    expect(result.current.formData).toEqual({
      username: '',
      password: '',
    })
  })

  it('returns empty error and loading=false on mount', () => {
    const { result } = renderLogin()
    expect(result.current.error).toBe('')
    expect(result.current.loading).toBe(false)
  })
})
