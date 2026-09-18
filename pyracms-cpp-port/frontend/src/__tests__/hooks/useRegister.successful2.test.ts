

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

  it('navigates to a custom redirectTo on success', async () => {
    mockApi.post.mockResolvedValueOnce({
      data: { token: 'regTok3', user: MOCK_USER },
    })
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(
      () => useRegister('/welcome'),
      { wrapper: Wrapper },
    )
    act(() => { fillValidForm(result) })
    await act(async () => {
      await result.current.handleSubmit(fakeEvent())
    })
    expect(mockPush).toHaveBeenCalledWith('/welcome')
  })

  it('successful registration clears any previous error', async () => {
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useRegister(), {
      wrapper: Wrapper,
    })
    // Trigger a validation error first
    await act(async () => {
      await result.current.handleSubmit(fakeEvent())
    })
    expect(result.current.error).toBeTruthy()

    // Now fill the form correctly and succeed
    mockApi.post.mockResolvedValueOnce({
      data: { token: 'tok', user: MOCK_USER },
    })
    act(() => { fillValidForm(result) })
    await act(async () => {
      await result.current.handleSubmit(fakeEvent())
    })
    expect(result.current.error).toBe('')
  })

  it('sets error from response.data.error when token absent', async () => {
    mockApi.post.mockResolvedValueOnce({
      data: { error: 'Username already taken' },
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
      'Username already taken',
    )
  })
})
