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

describe('updateField(name) – auto-slug generation', () => {
  /**
   * Bug-fix regression: previously the auto-slug guard read `form.slug`
   * from the closure (stale value).  After two rapid name updates the
   * second call would always see an empty slug in the closure and
   * overwrite any auto-generated value from the first call.
   *
   * The fix reads `prev.slug` inside the functional updater so it
   * always observes the latest queued state.
   */
  it('uses prev.slug (not stale closure) for the auto-slug guard', () => {
    const { result } = renderHook(() => useCreateSite())

    act(() => {
      // First update: slug is '' → auto-generate 'first-name'
      result.current.updateField('name', 'First Name')
      // Second update inside same act(): the functional updater must
      // see prev.slug = 'first-name' (already set) and NOT overwrite.
      result.current.updateField('name', 'Second Name')
    })

    // The slug should reflect the FIRST auto-generated value; the
    // second name change must not reset it to 'second-name'.
    expect(result.current.form.slug).toBe('first-name')
    expect(result.current.form.name).toBe('Second Name')
  })

  it('generates slug with no leading or trailing hyphens', () => {
    const { result } = renderHook(() => useCreateSite())

    act(() => {
      result.current.updateField('name', '---cool site---')
    })

    expect(result.current.form.slug).toBe('cool-site')
  })
})

describe('updateField(slug)', () => {
  it('updates slug directly when value is valid', () => {
    const { result } = renderHook(() => useCreateSite())

    act(() => {
      result.current.updateField('slug', 'my-custom-slug')
    })

    expect(result.current.form.slug).toBe('my-custom-slug')
    expect(result.current.error).toBe('')
  })
})
