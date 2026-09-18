

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

  it('updateField updates the password field', () => {
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useLogin(), {
      wrapper: Wrapper,
    })
    act(() => {
      result.current.updateField('password', 'hunter2')
    })
    expect(result.current.formData.password).toBe('hunter2')
  })

  it('updateField does not affect other fields', () => {
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useLogin(), {
      wrapper: Wrapper,
    })
    act(() => {
      result.current.updateField('username', 'bob')
    })
    expect(result.current.formData.password).toBe('')
  })

  it('sets error and does not call API when username is empty', async () => {
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useLogin(), {
      wrapper: Wrapper,
    })
    await act(async () => {
      await result.current.handleSubmit(fakeEvent())
    })
    expect(result.current.error).toBe('Username is required')
    expect(mockApi.post).not.toHaveBeenCalled()
  })

  it('sets error and does not call API when password is empty', async () => {
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useLogin(), {
      wrapper: Wrapper,
    })
    act(() => {
      result.current.updateField('username', 'alice')
    })
    await act(async () => {
      await result.current.handleSubmit(fakeEvent())
    })
    expect(result.current.error).toBe('Password is required')
    expect(mockApi.post).not.toHaveBeenCalled()
  })

  it('loading stays false after a validation failure', async () => {
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useLogin(), {
      wrapper: Wrapper,
    })
    await act(async () => {
      await result.current.handleSubmit(fakeEvent())
    })
    expect(result.current.loading).toBe(false)
  })
})
