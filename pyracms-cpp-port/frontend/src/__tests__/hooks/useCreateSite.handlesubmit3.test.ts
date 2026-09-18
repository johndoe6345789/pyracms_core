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

describe('handleSubmit – API error response', () => {
  it('does not navigate on API error', async () => {
    mockPost.mockRejectedValueOnce({
      response: { data: { error: 'Conflict' } },
    })
    const { result } = renderHook(() => useCreateSite())

    await act(async () => {
      await result.current.handleSubmit(fakeSubmitEvent())
    })

    expect(mockPush).not.toHaveBeenCalled()
  })
})

describe('handleSubmit – network error', () => {
  it('sets connection error for errors with no response', async () => {
    mockPost.mockRejectedValueOnce(new Error('Network Error'))
    const { result } = renderHook(() => useCreateSite())

    await act(async () => {
      await result.current.handleSubmit(fakeSubmitEvent())
    })

    expect(result.current.error).toBe('Unable to connect to server')
  })

  it('handles a plain string rejection value', async () => {
    mockPost.mockRejectedValueOnce('timeout')
    const { result } = renderHook(() => useCreateSite())

    await act(async () => {
      await result.current.handleSubmit(fakeSubmitEvent())
    })

    expect(result.current.error).toBe('Unable to connect to server')
  })
})

describe('loading flag', () => {
  it('is true while the request is in-flight', async () => {
    let resolvePost!: (v: unknown) => void
    mockPost.mockReturnValueOnce(
      new Promise((res) => { resolvePost = res }),
    )

    const { result } = renderHook(() => useCreateSite())

    // Start submit but do not await
    act(() => {
      void result.current.handleSubmit(fakeSubmitEvent())
    })

    expect(result.current.loading).toBe(true)

    // Now resolve the promise and wait for state to settle
    await act(async () => { resolvePost({ data: {} }) })

    expect(result.current.loading).toBe(false)
  })
})
