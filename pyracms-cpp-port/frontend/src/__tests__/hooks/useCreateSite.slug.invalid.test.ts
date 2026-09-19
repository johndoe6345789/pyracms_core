/**
 * Tests for src/hooks/useCreateSite.ts: invalid slug rejection.
 */

import { renderHook, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import {
  navigationMock,
  apiMock,
} from '../helpers/createSiteHook'
import { useCreateSite } from '@/hooks/useCreateSite'

jest.mock('next/navigation', () => navigationMock())
jest.mock('@/lib/api', () => apiMock())

beforeEach(() => {
  jest.clearAllMocks()
})

describe('updateField(slug)', () => {
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
})
