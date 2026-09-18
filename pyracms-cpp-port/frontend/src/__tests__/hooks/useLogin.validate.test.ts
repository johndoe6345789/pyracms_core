

const mockPush = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))
jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { post: jest.fn() },
}))

describe('validateLoginForm', () => {
  it('returns empty string for valid data', () => {
    expect(validateLoginForm(VALID_FORM)).toBe('')
  })

  it('returns error when username is blank', () => {
    expect(
      validateLoginForm({ username: '  ', password: 'x' }),
    ).toBe('Username is required')
  })

  it('returns error when username is empty string', () => {
    expect(
      validateLoginForm({ username: '', password: 'x' }),
    ).toBe('Username is required')
  })

  it('returns error when password is empty', () => {
    expect(
      validateLoginForm({ username: 'alice', password: '' }),
    ).toBe('Password is required')
  })
})

describe('useLogin', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  it('returns empty formData on mount', () => {
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useLogin(), {
      wrapper: Wrapper,
    })
    expect(result.current.formData).toEqual({
      username: '',
      password: '',
    })
  })

  it('returns empty error and loading=false on mount', () => {
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useLogin(), {
      wrapper: Wrapper,
    })
    expect(result.current.error).toBe('')
    expect(result.current.loading).toBe(false)
  })

  it('updateField updates the username field', () => {
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useLogin(), {
      wrapper: Wrapper,
    })
    act(() => {
      result.current.updateField('username', 'alice')
    })
    expect(result.current.formData.username).toBe('alice')
  })
})
