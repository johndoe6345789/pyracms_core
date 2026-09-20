/**
 * Tests for src/hooks/useCreateSite.ts: resetForm.
 */

import { renderHook, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import {
  navigationMock,
  apiMock,
  mockPost,
  fakeSubmitEvent,
} from '../helpers/createSiteHook'
import { withStore, fillAdmin } from '../helpers/createSiteHook'
import { useCreateSite } from '@/hooks/useCreateSite'

jest.mock('next/navigation', () => navigationMock())
jest.mock('@/lib/api', () => apiMock())

beforeEach(() => {
  jest.clearAllMocks()
})

describe('resetForm', () => {
  it('clears all form fields back to empty strings', () => {
    const { result } = renderHook(() => useCreateSite(), { wrapper: withStore })

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
      adminUsername: '',
      adminEmail: '',
      adminPassword: '',
    })
  })

  it('clears the error state', async () => {
    mockPost.mockRejectedValueOnce(new Error('Network Error'))
    const { result } = renderHook(() => useCreateSite(), { wrapper: withStore })

    fillAdmin(result)
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
    const { result } = renderHook(() => useCreateSite(), { wrapper: withStore })

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
