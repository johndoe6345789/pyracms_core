import '@testing-library/jest-dom'

const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

const mockPost = jest.fn()
jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: {
    post: (...args: unknown[]) => mockPost(...args),
  },
}))

beforeEach(() => {
  jest.clearAllMocks()
})

describe('handleSubmit – success', () => {
  it('calls POST /api/tenants with correct payload', async () => {
    mockPost.mockResolvedValueOnce({ data: {} })
    const { result } = renderHook(() => useCreateSite())

    act(() => {
      result.current.updateField('name', 'My Blog')
    })
    act(() => {
      result.current.updateField('description', 'A blog')
    })

    await act(async () => {
      await result.current.handleSubmit(fakeSubmitEvent())
    })

    expect(mockPost).toHaveBeenCalledWith('/api/tenants', {
      slug: 'my-blog',
      displayName: 'My Blog',
      description: 'A blog',
    })
  })

  it('navigates to /site/{slug} on success', async () => {
    mockPost.mockResolvedValueOnce({ data: {} })
    const { result } = renderHook(() => useCreateSite())

    act(() => {
      result.current.updateField('name', 'My Blog')
    })

    await act(async () => {
      await result.current.handleSubmit(fakeSubmitEvent())
    })

    expect(mockPush).toHaveBeenCalledWith('/site/my-blog')
  })

  it('calls preventDefault on the submit event', async () => {
    mockPost.mockResolvedValueOnce({ data: {} })
    const { result } = renderHook(() => useCreateSite())
    const { event, preventDefault } = makeMockFormEvent()

    await act(async () => {
      await result.current.handleSubmit(event)
    })

    expect(preventDefault).toHaveBeenCalledTimes(1)
  })
})
