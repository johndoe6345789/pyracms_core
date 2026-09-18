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
  it('leaves error as empty string after success', async () => {
    mockPost.mockResolvedValueOnce({ data: {} })
    const { result } = renderHook(() => useCreateSite())

    act(() => {
      result.current.updateField('name', 'My Blog')
    })

    await act(async () => {
      await result.current.handleSubmit(fakeSubmitEvent())
    })

    expect(result.current.error).toBe('')
  })
})

describe('handleSubmit – API error response', () => {
  it('sets the error from response.data.error', async () => {
    mockPost.mockRejectedValueOnce({
      response: { data: { error: 'Slug already taken' } },
    })
    const { result } = renderHook(() => useCreateSite())

    await act(async () => {
      await result.current.handleSubmit(fakeSubmitEvent())
    })

    expect(result.current.error).toBe('Slug already taken')
  })

  it('falls back to generic message when data.error is absent', async () => {
    mockPost.mockRejectedValueOnce({ response: { data: {} } })
    const { result } = renderHook(() => useCreateSite())

    await act(async () => {
      await result.current.handleSubmit(fakeSubmitEvent())
    })

    expect(result.current.error).toBe('Failed to create site')
  })

  it('falls back to generic message when response.data is absent', async () => {
    mockPost.mockRejectedValueOnce({ response: {} })
    const { result } = renderHook(() => useCreateSite())

    await act(async () => {
      await result.current.handleSubmit(fakeSubmitEvent())
    })

    expect(result.current.error).toBe('Failed to create site')
  })
})
