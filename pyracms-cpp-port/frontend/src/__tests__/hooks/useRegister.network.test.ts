

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

  it('sets "Unable to connect to server" on network error', async () => {
    mockApi.post.mockRejectedValueOnce(new Error('Network Error'))
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useRegister(), {
      wrapper: Wrapper,
    })
    act(() => { fillValidForm(result) })
    await act(async () => {
      await result.current.handleSubmit(fakeEvent())
    })
    expect(result.current.error).toBe(
      'Unable to connect to server',
    )
  })

  it('sets "Unable to connect to server" when err is string', async () => {
    mockApi.post.mockRejectedValueOnce('timeout')
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useRegister(), {
      wrapper: Wrapper,
    })
    act(() => { fillValidForm(result) })
    await act(async () => {
      await result.current.handleSubmit(fakeEvent())
    })
    expect(result.current.error).toBe(
      'Unable to connect to server',
    )
  })

  it('loading is false after successful request completes', async () => {
    mockApi.post.mockResolvedValueOnce({
      data: { token: 'tok', user: MOCK_USER },
    })
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useRegister(), {
      wrapper: Wrapper,
    })
    act(() => { fillValidForm(result) })
    await act(async () => {
      await result.current.handleSubmit(fakeEvent())
    })
    expect(result.current.loading).toBe(false)
  })

  it('loading is false after failed request completes', async () => {
    mockApi.post.mockRejectedValueOnce(new Error('Network Error'))
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useRegister(), {
      wrapper: Wrapper,
    })
    act(() => { fillValidForm(result) })
    await act(async () => {
      await result.current.handleSubmit(fakeEvent())
    })
    expect(result.current.loading).toBe(false)
  })
})
