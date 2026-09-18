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

describe('loading flag', () => {
  it('is false after a successful response', async () => {
    mockPost.mockResolvedValueOnce({ data: {} })
    const { result } = renderHook(() => useCreateSite())

    await act(async () => {
      await result.current.handleSubmit(fakeSubmitEvent())
    })

    expect(result.current.loading).toBe(false)
  })

  it('is false after an error response', async () => {
    mockPost.mockRejectedValueOnce({ response: { data: { error: 'err' } } })
    const { result } = renderHook(() => useCreateSite())

    await act(async () => {
      await result.current.handleSubmit(fakeSubmitEvent())
    })

    expect(result.current.loading).toBe(false)
  })
})

describe('resetForm', () => {
  it('clears all form fields back to empty strings', () => {
    const { result } = renderHook(() => useCreateSite())

    act(() => {
      result.current.updateField('name', 'Old Name')
      result.current.updateField('description', 'Old Desc')
    })
    act(() => {
      result.current.resetForm()
    })

    expect(result.current.form).toEqual({
      slug: '',
      name: '',
      description: '',
    })
  })

  it('clears the error state', async () => {
    mockPost.mockRejectedValueOnce(new Error('Network Error'))
    const { result } = renderHook(() => useCreateSite())

    await act(async () => {
      await result.current.handleSubmit(fakeSubmitEvent())
    })
    expect(result.current.error).not.toBe('')

    act(() => {
      result.current.resetForm()
    })

    expect(result.current.error).toBe('')
  })
})
