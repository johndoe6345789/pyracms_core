

const mockPush = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))
jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { post: jest.fn() },
}))

describe('validateRegisterForm', () => {
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
    const { confirmPassword: _cp, ...noConfirm } = VALID_FORM
    expect(validateRegisterForm(noConfirm)).toBe('')
  })

  it('accepts optional firstName / lastName being absent', () => {
    const {
      firstName: _f,
      lastName: _l,
      ...minimal
    } = VALID_FORM
    expect(validateRegisterForm(minimal)).toBe('')
  })
})

describe('useRegister', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  it('returns empty formData on mount', () => {
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useRegister(), {
      wrapper: Wrapper,
    })
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
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useRegister(), {
      wrapper: Wrapper,
    })
    expect(result.current.error).toBe('')
    expect(result.current.loading).toBe(false)
  })
})
