

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

  it('successful login stores token in localStorage', async () => {
    mockApi.post.mockResolvedValueOnce({
      data: { token: 'tok123', user: MOCK_USER },
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
    expect(localStorage.getItem('token')).toBe('tok123')
  })

  it('successful login dispatches setCredentials to the store', async () => {
    mockApi.post.mockResolvedValueOnce({
      data: { token: 'tok123', user: MOCK_USER },
    })
    const { store, Wrapper } = makeWrapper()
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
    const auth = (store.getState() as { auth: { token: string } })
      .auth
    expect(auth.token).toBe('tok123')
  })

  it('successful login navigates to default "/" path', async () => {
    mockApi.post.mockResolvedValueOnce({
      data: { token: 'tok123', user: MOCK_USER },
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
    expect(mockPush).toHaveBeenCalledWith('/')
  })
})
