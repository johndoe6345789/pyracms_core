

const mockPush = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
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

  it('updateField updates the username field', () => {
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useRegister(), {
      wrapper: Wrapper,
    })
    act(() => {
      result.current.updateField('username', 'carol')
    })
    expect(result.current.formData.username).toBe('carol')
  })

  it('updateField updates the email field', () => {
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useRegister(), {
      wrapper: Wrapper,
    })
    act(() => {
      result.current.updateField(
        'email',
        'carol@example.com',
      )
    })
    expect(result.current.formData.email).toBe(
      'carol@example.com',
    )
  })

  it('updateField updates the password field', () => {
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useRegister(), {
      wrapper: Wrapper,
    })
    act(() => {
      result.current.updateField('password', 'newpass1')
    })
    expect(result.current.formData.password).toBe('newpass1')
  })

  it('updateField updates confirmPassword field', () => {
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useRegister(), {
      wrapper: Wrapper,
    })
    act(() => {
      result.current.updateField(
        'confirmPassword',
        'newpass1',
      )
    })
    expect(result.current.formData.confirmPassword).toBe(
      'newpass1',
    )
  })
})
