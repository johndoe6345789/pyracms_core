

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

  it('loading is false after server-side error (no token)', async () => {
    mockApi.post.mockResolvedValueOnce({
      data: { error: 'Taken' },
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

  it('calls POST /api/auth/register without confirmPassword', async () => {
    mockApi.post.mockResolvedValueOnce({
      data: { token: 'tok', user: MOCK_USER },
    })
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useRegister(), {
      wrapper: Wrapper,
    })
    act(() => {
      result.current.updateField('username', 'carol')
      result.current.updateField(
        'email',
        'carol@example.com',
      )
      result.current.updateField('password', 'securepass')
      result.current.updateField(
        'confirmPassword',
        'securepass',
      )
      result.current.updateField('firstName', 'Carol')
      result.current.updateField('lastName', 'Jones')
    })
    await act(async () => {
      await result.current.handleSubmit(fakeEvent())
    })
    expect(mockApi.post).toHaveBeenCalledWith(
      '/api/auth/register',
      {
        username: 'carol',
        email: 'carol@example.com',
        password: 'securepass',
        firstName: 'Carol',
        lastName: 'Jones',
      },
    )
    const payload = mockApi.post.mock.calls[0]![1] as Record<
      string,
      unknown
    >
    expect(payload).not.toHaveProperty('confirmPassword')
  })
})
