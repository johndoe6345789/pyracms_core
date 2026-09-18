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

describe('resetForm', () => {
  it('allows auto-slug generation again after reset', () => {
    const { result } = renderHook(() => useCreateSite())

    // Fill in and then reset
    act(() => {
      result.current.updateField('name', 'First Name')
    })
    act(() => {
      result.current.resetForm()
    })

    // After reset slug is '' so a new name update should auto-generate
    act(() => {
      result.current.updateField('name', 'Second Name')
    })

    expect(result.current.form.slug).toBe('second-name')
  })
})
