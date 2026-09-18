

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

  it('calls POST /api/auth/login with the form data', async () => {
    mockApi.post.mockResolvedValueOnce({
      data: { token: 'tok', user: MOCK_USER },
    })
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useLogin(), {
      wrapper: Wrapper,
    })
    act(() => {
      result.current.updateField('username', 'alice')
      result.current.updateField('password', 'pass123')
    })
    await act(async () => {
      await result.current.handleSubmit(fakeEvent())
    })
    expect(mockApi.post).toHaveBeenCalledWith(
      '/api/auth/login',
      { username: 'alice', password: 'pass123' },
    )
  })
})
