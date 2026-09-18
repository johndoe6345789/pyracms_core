

const mockPush = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))
jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { post: jest.fn() },
}))

describe('useLogin', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  it('successful login navigates to a custom redirectTo path', async () => {
    mockApi.post.mockResolvedValueOnce({
      data: { token: 'tok456', user: MOCK_USER },
    })
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(
      () => useLogin('/dashboard'),
      { wrapper: Wrapper },
    )
    act(() => {
      result.current.updateField('username', VALID_FORM.username)
      result.current.updateField('password', VALID_FORM.password)
    })
    await act(async () => {
      await result.current.handleSubmit(fakeEvent())
    })
    expect(mockPush).toHaveBeenCalledWith('/dashboard')
  })

  it('successful login clears any previous error', async () => {
    // First trigger a validation error…
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useLogin(), {
      wrapper: Wrapper,
    })
    await act(async () => {
      await result.current.handleSubmit(fakeEvent())
    })
    expect(result.current.error).toBeTruthy()

    // …then supply valid data and a successful response
    mockApi.post.mockResolvedValueOnce({
      data: { token: 'tok789', user: MOCK_USER },
    })
    act(() => {
      result.current.updateField('username', VALID_FORM.username)
      result.current.updateField('password', VALID_FORM.password)
    })
    await act(async () => {
      await result.current.handleSubmit(fakeEvent())
    })
    expect(result.current.error).toBe('')
  })

  it('sets error from response.data.error when token is absent', async () => {
    mockApi.post.mockResolvedValueOnce({
      data: { error: 'Invalid credentials' },
    })
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useLogin(), {
      wrapper: Wrapper,
    })
    act(() => {
      result.current.updateField('username', VALID_FORM.username)
      result.current.updateField('password', VALID_FORM.password)
    })
    await act(async () => {
      await result.current.handleSubmit(fakeEvent())
    })
    expect(result.current.error).toBe('Invalid credentials')
  })
})
