

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

  it('sets error and skips API when password is too short', async () => {
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useRegister(), {
      wrapper: Wrapper,
    })
    act(() => {
      fillValidForm(result, {
        password: 'abc',
        confirmPassword: 'abc',
      })
    })
    await act(async () => {
      await result.current.handleSubmit(fakeEvent())
    })
    expect(result.current.error).toBe(
      'Password must be at least 8 characters',
    )
    expect(mockApi.post).not.toHaveBeenCalled()
  })

  it('sets error when confirmPassword does not match', async () => {
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useRegister(), {
      wrapper: Wrapper,
    })
    act(() => {
      fillValidForm(result, { confirmPassword: 'mismatch' })
    })
    await act(async () => {
      await result.current.handleSubmit(fakeEvent())
    })
    expect(result.current.error).toBe(
      'Passwords do not match',
    )
    expect(mockApi.post).not.toHaveBeenCalled()
  })

  it('loading stays false after a validation failure', async () => {
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useRegister(), {
      wrapper: Wrapper,
    })
    await act(async () => {
      await result.current.handleSubmit(fakeEvent())
    })
    expect(result.current.loading).toBe(false)
  })
})
