/** useRegister: client-side validation (no API call). */
import {
  fill,
  mockApi,
  renderRegister,
  submit,
} from '../helpers/useRegisterHelpers'

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}))

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { post: jest.fn() },
}))

describe('useRegister', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  it('sets error and skips API when username is empty', async () => {
    const { result } = renderRegister()
    await submit(result)
    expect(result.current.error).toBe('Username is required')
    expect(mockApi.post).not.toHaveBeenCalled()
  })

  it('sets error and skips API when email is invalid', async () => {
    const { result } = renderRegister()
    fill(result, { email: 'bademail' })
    await submit(result)
    expect(result.current.error).toBe('Invalid email address')
    expect(mockApi.post).not.toHaveBeenCalled()
  })

  it('sets error and skips API when password is too short', async () => {
    const { result } = renderRegister()
    fill(result, { password: 'abc', confirmPassword: 'abc' })
    await submit(result)
    expect(result.current.error).toBe(
      'Password must be at least 8 characters',
    )
    expect(mockApi.post).not.toHaveBeenCalled()
  })

  it('sets error when confirmPassword does not match', async () => {
    const { result } = renderRegister()
    fill(result, { confirmPassword: 'mismatch' })
    await submit(result)
    expect(result.current.error).toBe('Passwords do not match')
    expect(mockApi.post).not.toHaveBeenCalled()
  })

  it('loading stays false after a validation failure', async () => {
    const { result } = renderRegister()
    await submit(result)
    expect(result.current.loading).toBe(false)
  })
})
