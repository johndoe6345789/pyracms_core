

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

  it('updateField updates firstName', () => {
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useRegister(), {
      wrapper: Wrapper,
    })
    act(() => {
      result.current.updateField('firstName', 'Carol')
    })
    expect(result.current.formData.firstName).toBe('Carol')
  })

  it('updateField updates lastName', () => {
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useRegister(), {
      wrapper: Wrapper,
    })
    act(() => {
      result.current.updateField('lastName', 'Jones')
    })
    expect(result.current.formData.lastName).toBe('Jones')
  })

  it('updateField does not affect other fields', () => {
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useRegister(), {
      wrapper: Wrapper,
    })
    act(() => {
      result.current.updateField('username', 'carol')
    })
    expect(result.current.formData.email).toBe('')
    expect(result.current.formData.password).toBe('')
  })

  it('sets error and skips API when username is empty', async () => {
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useRegister(), {
      wrapper: Wrapper,
    })
    await act(async () => {
      await result.current.handleSubmit(fakeEvent())
    })
    expect(result.current.error).toBe('Username is required')
    expect(mockApi.post).not.toHaveBeenCalled()
  })

  it('sets error and skips API when email is invalid', async () => {
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useRegister(), {
      wrapper: Wrapper,
    })
    act(() => {
      fillValidForm(result, { email: 'bademail' })
    })
    await act(async () => {
      await result.current.handleSubmit(fakeEvent())
    })
    expect(result.current.error).toBe('Invalid email address')
    expect(mockApi.post).not.toHaveBeenCalled()
  })
})
