/** useRegister: initial state. */
import { renderRegister } from '../helpers/useRegisterHelpers'

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

  it('returns empty formData on mount', () => {
    const { result } = renderRegister()
    expect(result.current.formData).toEqual({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
    })
  })

  it('returns empty error and loading=false on mount', () => {
    const { result } = renderRegister()
    expect(result.current.error).toBe('')
    expect(result.current.loading).toBe(false)
  })
})
