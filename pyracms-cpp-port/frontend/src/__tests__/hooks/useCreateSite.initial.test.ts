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

describe('initial state', () => {
  it('returns empty strings for all form fields', () => {
    const { result } = renderHook(() => useCreateSite())

    expect(result.current.form).toEqual({
      slug: '',
      name: '',
      description: '',
    })
  })

  it('starts with loading=false', () => {
    const { result } = renderHook(() => useCreateSite())
    expect(result.current.loading).toBe(false)
  })

  it('starts with an empty error string', () => {
    const { result } = renderHook(() => useCreateSite())
    expect(result.current.error).toBe('')
  })
})

describe('updateField(name) – auto-slug generation', () => {
  it('sets name and generates a slug from a simple name', () => {
    const { result } = renderHook(() => useCreateSite())

    act(() => {
      result.current.updateField('name', 'My Blog')
    })

    expect(result.current.form.name).toBe('My Blog')
    expect(result.current.form.slug).toBe('my-blog')
  })

  it('strips special characters when generating the slug', () => {
    const { result } = renderHook(() => useCreateSite())

    act(() => {
      result.current.updateField('name', 'Hello World!!!')
    })

    expect(result.current.form.slug).toBe('hello-world')
  })

  it('does not overwrite a manually set slug when name changes', () => {
    const { result } = renderHook(() => useCreateSite())

    // Manually set the slug first
    act(() => {
      result.current.updateField('slug', 'custom-slug')
    })

    // Now update the name – slug must stay 'custom-slug'
    act(() => {
      result.current.updateField('name', 'Totally Different Name')
    })

    expect(result.current.form.slug).toBe('custom-slug')
    expect(result.current.form.name).toBe('Totally Different Name')
  })
})
