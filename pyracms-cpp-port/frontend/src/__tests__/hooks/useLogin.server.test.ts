

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

  it('falls back when token is absent and no error msg exists', async () => {
    mockApi.post.mockResolvedValueOnce({ data: {} })
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
    expect(result.current.error).toBe('Login failed')
  })

  it('does not navigate when token is absent', async () => {
    mockApi.post.mockResolvedValueOnce({ data: {} })
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
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('sets server error message from caught axios error', async () => {
    mockApi.post.mockRejectedValueOnce({
      response: { data: { error: 'Account locked' } },
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
    expect(result.current.error).toBe('Account locked')
  })
})
