

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

  it('falls back to "Registration failed" when no error msg', async () => {
    mockApi.post.mockResolvedValueOnce({ data: {} })
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useRegister(), {
      wrapper: Wrapper,
    })
    act(() => { fillValidForm(result) })
    await act(async () => {
      await result.current.handleSubmit(fakeEvent())
    })
    expect(result.current.error).toBe('Registration failed')
  })

  it('does not navigate when token is absent', async () => {
    mockApi.post.mockResolvedValueOnce({ data: {} })
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useRegister(), {
      wrapper: Wrapper,
    })
    act(() => { fillValidForm(result) })
    await act(async () => {
      await result.current.handleSubmit(fakeEvent())
    })
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('sets server error message from caught axios error', async () => {
    mockApi.post.mockRejectedValueOnce({
      response: {
        data: { error: 'Email already registered' },
      },
    })
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useRegister(), {
      wrapper: Wrapper,
    })
    act(() => { fillValidForm(result) })
    await act(async () => {
      await result.current.handleSubmit(fakeEvent())
    })
    expect(result.current.error).toBe(
      'Email already registered',
    )
  })

  it('falls back to "Registration failed" on axios err', async () => {
    mockApi.post.mockRejectedValueOnce({
      response: { data: {} },
    })
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useRegister(), {
      wrapper: Wrapper,
    })
    act(() => { fillValidForm(result) })
    await act(async () => {
      await result.current.handleSubmit(fakeEvent())
    })
    expect(result.current.error).toBe('Registration failed')
  })
})
