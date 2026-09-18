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
  it('rejects a slug with a trailing hyphen and sets error', () => {
    const { result } = renderHook(() => useCreateSite())

    act(() => {
      result.current.updateField('slug', 'trailing-')
    })

    expect(result.current.form.slug).toBe('')
    expect(result.current.error).not.toBe('')
  })

  it('accepts an empty string as slug (clearing it)', () => {
    const { result } = renderHook(() => useCreateSite())

    act(() => {
      result.current.updateField('slug', 'valid-slug')
    })
    act(() => {
      result.current.updateField('slug', '')
    })

    expect(result.current.form.slug).toBe('')
    expect(result.current.error).toBe('')
  })

  it('clears a previous validation error when a valid slug is entered', () => {
    const { result } = renderHook(() => useCreateSite())

    act(() => {
      result.current.updateField('slug', 'bad slug')
    })
    expect(result.current.error).not.toBe('')

    act(() => {
      result.current.updateField('slug', 'good-slug')
    })
    expect(result.current.error).toBe('')
    expect(result.current.form.slug).toBe('good-slug')
  })
})

describe('updateField(description)', () => {
  it('updates description without affecting name or slug', () => {
    const { result } = renderHook(() => useCreateSite())

    act(() => {
      result.current.updateField('name', 'Test Site')
    })
    act(() => {
      result.current.updateField('description', 'A test description')
    })

    expect(result.current.form.description).toBe('A test description')
    expect(result.current.form.name).toBe('Test Site')
    expect(result.current.form.slug).toBe('test-site')
  })
})
