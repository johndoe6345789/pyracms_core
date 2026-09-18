

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

  it('loading is false after a successful request completes', async () => {
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
    expect(result.current.loading).toBe(false)
  })

  it('loading is false after a failed request completes', async () => {
    mockApi.post.mockRejectedValueOnce(new Error('Network Error'))
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
    expect(result.current.loading).toBe(false)
  })

  it('loading is false after a server-side error (no token)', async () => {
    mockApi.post.mockResolvedValueOnce({
      data: { error: 'Bad creds' },
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
    expect(result.current.loading).toBe(false)
  })
})
