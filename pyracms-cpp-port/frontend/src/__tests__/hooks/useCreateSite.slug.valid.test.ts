/**
 * Tests for src/hooks/useCreateSite.ts: valid slug updates.
 */

import { renderHook, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import { navigationMock, apiMock } from '../helpers/createSiteHook'
import { withStore } from '../helpers/createSiteHook'
import { useCreateSite } from '@/hooks/useCreateSite'

jest.mock('next/navigation', () => navigationMock())
jest.mock('@/lib/api', () => apiMock())

beforeEach(() => {
  jest.clearAllMocks()
})

describe('updateField(slug)', () => {
  it('updates slug directly when value is valid', () => {
    const { result } = renderHook(() => useCreateSite(), { wrapper: withStore })

    act(() => {
      result.current.updateField('slug', 'my-custom-slug')
    })

    expect(result.current.form.slug).toBe('my-custom-slug')
    expect(result.current.error).toBe('')
  })

  it('does not change name when only slug is updated', () => {
    const { result } = renderHook(() => useCreateSite(), { wrapper: withStore })

    act(() => {
      result.current.updateField('name', 'Some Name')
    })
    act(() => {
      result.current.updateField('slug', 'different-slug')
    })

    expect(result.current.form.name).toBe('Some Name')
    expect(result.current.form.slug).toBe('different-slug')
  })

  it('accepts an empty string as slug (clearing it)', () => {
    const { result } = renderHook(() => useCreateSite(), { wrapper: withStore })

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
    const { result } = renderHook(() => useCreateSite(), { wrapper: withStore })

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
