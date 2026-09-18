

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

  it('successful registration stores token in localStorage', async () => {
    mockApi.post.mockResolvedValueOnce({
      data: { token: 'regTok1', user: MOCK_USER },
    })
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useRegister(), {
      wrapper: Wrapper,
    })
    act(() => { fillValidForm(result) })
    await act(async () => {
      await result.current.handleSubmit(fakeEvent())
    })
    expect(localStorage.getItem('token')).toBe('regTok1')
  })

  it('successful registration dispatches setCredentials', async () => {
    mockApi.post.mockResolvedValueOnce({
      data: { token: 'regTok1', user: MOCK_USER },
    })
    const { store, Wrapper } = makeWrapper()
    const { result } = renderHook(() => useRegister(), {
      wrapper: Wrapper,
    })
    act(() => { fillValidForm(result) })
    await act(async () => {
      await result.current.handleSubmit(fakeEvent())
    })
    const auth = (
      store.getState() as { auth: { token: string } }
    ).auth
    expect(auth.token).toBe('regTok1')
  })

  it('navigates to default "/" path on success', async () => {
    mockApi.post.mockResolvedValueOnce({
      data: { token: 'regTok2', user: MOCK_USER },
    })
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useRegister(), {
      wrapper: Wrapper,
    })
    act(() => { fillValidForm(result) })
    await act(async () => {
      await result.current.handleSubmit(fakeEvent())
    })
    expect(mockPush).toHaveBeenCalledWith('/')
  })
})
