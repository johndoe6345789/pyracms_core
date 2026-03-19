/**
 * Tests for src/hooks/useCreateSite.ts
 *
 * Coverage targets:
 *  - Initial form state
 *  - Auto-slug generation from name (including bug fix: uses prev.slug
 *    from functional updater rather than stale closure value)
 *  - Manual slug update + validation
 *  - Successful POST and router navigation
 *  - API error response (response.data.error)
 *  - API error response (no data.error → fallback message)
 *  - Network error (no response object)
 *  - loading flag transitions
 *  - resetForm
 */

import { renderHook, act } from '@testing-library/react'
import '@testing-library/jest-dom'

// ─── mocks ──────────────────────────────────────────────────────────────────

const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

const mockPost = jest.fn()
jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { post: (...args: unknown[]) => mockPost(...args) },
}))

// ─── import after mocks ──────────────────────────────────────────────────────

import { useCreateSite } from '@/hooks/useCreateSite'

// ─── helpers ─────────────────────────────────────────────────────────────────

/**
 * Builds a minimal synthetic FormEvent whose preventDefault is a jest spy.
 */
function fakeSubmitEvent(): React.FormEvent {
  return { preventDefault: jest.fn() } as unknown as React.FormEvent
}

// ─── tests ───────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks()
})

// ── 1. Initial state ─────────────────────────────────────────────────────────

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

// ── 2. Auto-slug from name ────────────────────────────────────────────────────

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

// ── 3. Manual slug update + validation ───────────────────────────────────────

describe('updateField(slug)', () => {
  it('updates slug directly when value is valid', () => {
    const { result } = renderHook(() => useCreateSite())

    act(() => {
      result.current.updateField('slug', 'my-custom-slug')
    })

    expect(result.current.form.slug).toBe('my-custom-slug')
    expect(result.current.error).toBe('')
  })

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

// ── 4. description field passthrough ─────────────────────────────────────────

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

// ── 5. Successful submit ──────────────────────────────────────────────────────

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
    const event = fakeSubmitEvent()
    const preventDefaultSpy = event.preventDefault as jest.Mock

    await act(async () => {
      await result.current.handleSubmit(event)
    })

    expect(preventDefaultSpy).toHaveBeenCalledTimes(1)
  })

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

// ── 6. API error response ─────────────────────────────────────────────────────

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

// ── 7. Network error ──────────────────────────────────────────────────────────

describe('handleSubmit – network error', () => {
  it('sets "Unable to connect to server" for errors with no response', async () => {
    mockPost.mockRejectedValueOnce(new Error('Network Error'))
    const { result } = renderHook(() => useCreateSite())

    await act(async () => {
      await result.current.handleSubmit(fakeSubmitEvent())
    })

    expect(result.current.error).toBe('Unable to connect to server')
  })

  it('sets the same message when the rejection value is a plain string', async () => {
    mockPost.mockRejectedValueOnce('timeout')
    const { result } = renderHook(() => useCreateSite())

    await act(async () => {
      await result.current.handleSubmit(fakeSubmitEvent())
    })

    expect(result.current.error).toBe('Unable to connect to server')
  })
})

// ── 8. loading flag ───────────────────────────────────────────────────────────

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

// ── 9. resetForm ─────────────────────────────────────────────────────────────

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
