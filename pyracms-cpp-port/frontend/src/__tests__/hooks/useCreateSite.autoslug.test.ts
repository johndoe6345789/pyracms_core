/**
 * Tests for src/hooks/useCreateSite.ts: auto-slug from name.
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

// ── 2. Auto-slug from name ───────────────────────────────────

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

  it('generates slug with no leading or trailing hyphens', () => {
    const { result } = renderHook(() => useCreateSite())

    act(() => {
      result.current.updateField('name', '---cool site---')
    })

    expect(result.current.form.slug).toBe('cool-site')
  })
})
