/**
 * Tests for src/hooks/useCreateSite.ts: initial state and
 * description passthrough.
 */

import { renderHook, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import { navigationMock, apiMock } from '../helpers/createSiteHook'
import { useCreateSite } from '@/hooks/useCreateSite'

jest.mock('next/navigation', () => navigationMock())
jest.mock('@/lib/api', () => apiMock())

beforeEach(() => {
  jest.clearAllMocks()
})

// ── 1. Initial state ─────────────────────────────────────────

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

// ── 4. description field passthrough ─────────────────────────

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
