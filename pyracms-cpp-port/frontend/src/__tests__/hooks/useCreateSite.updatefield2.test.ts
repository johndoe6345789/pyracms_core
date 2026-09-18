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

describe('updateField(slug)', () => {
  it('does not change name when only slug is updated', () => {
    const { result } = renderHook(() => useCreateSite())

    act(() => {
      result.current.updateField('name', 'Some Name')
    })
    act(() => {
      result.current.updateField('slug', 'different-slug')
    })

    expect(result.current.form.name).toBe('Some Name')
    expect(result.current.form.slug).toBe('different-slug')
  })

  it('rejects a slug containing spaces and sets error', () => {
    const { result } = renderHook(() => useCreateSite())

    act(() => {
      result.current.updateField('slug', 'bad slug')
    })

    expect(result.current.form.slug).toBe('')
    expect(result.current.error).not.toBe('')
  })

  it('rejects a slug with uppercase letters and sets error', () => {
    const { result } = renderHook(() => useCreateSite())

    act(() => {
      result.current.updateField('slug', 'Bad-Slug')
    })

    expect(result.current.form.slug).toBe('')
    expect(result.current.error).not.toBe('')
  })

  it('rejects a slug with special characters and sets error', () => {
    const { result } = renderHook(() => useCreateSite())

    act(() => {
      result.current.updateField('slug', 'bad@slug!')
    })

    expect(result.current.form.slug).toBe('')
    expect(result.current.error).not.toBe('')
  })

  it('rejects a slug with a leading hyphen and sets error', () => {
    const { result } = renderHook(() => useCreateSite())

    act(() => {
      result.current.updateField('slug', '-leading')
    })

    expect(result.current.form.slug).toBe('')
    expect(result.current.error).not.toBe('')
  })
})
