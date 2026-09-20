/**
 * Tests for src/hooks/useCreateSite.ts: API error responses.
 */

import { renderHook, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import {
  navigationMock,
  apiMock,
  mockPost,
  mockPush,
  fakeSubmitEvent,
} from '../helpers/createSiteHook'
import { withStore, fillAdmin } from '../helpers/createSiteHook'
import { useCreateSite } from '@/hooks/useCreateSite'

jest.mock('next/navigation', () => navigationMock())
jest.mock('@/lib/api', () => apiMock())

beforeEach(() => {
  jest.clearAllMocks()
})

describe('handleSubmit – API error response', () => {
  it('sets the error from response.data.error', async () => {
    mockPost.mockRejectedValueOnce({
      response: { data: { error: 'Slug already taken' } },
    })
    const { result } = renderHook(() => useCreateSite(), { wrapper: withStore })

    fillAdmin(result)
    await act(async () => {
      await result.current.handleSubmit(fakeSubmitEvent())
    })

    expect(result.current.error).toBe('Slug already taken')
  })

  it('falls back to generic message when data.error is absent', async () => {
    mockPost.mockRejectedValueOnce({
      response: { data: { token: 't', user: { id: 1, username: 'owner' } } },
    })
    const { result } = renderHook(() => useCreateSite(), { wrapper: withStore })

    fillAdmin(result)
    await act(async () => {
      await result.current.handleSubmit(fakeSubmitEvent())
    })

    expect(result.current.error).toBe('Failed to create site')
  })

  it('falls back to generic message when response.data is absent', async () => {
    mockPost.mockRejectedValueOnce({ response: {} })
    const { result } = renderHook(() => useCreateSite(), { wrapper: withStore })

    fillAdmin(result)
    await act(async () => {
      await result.current.handleSubmit(fakeSubmitEvent())
    })

    expect(result.current.error).toBe('Failed to create site')
  })

  it('does not navigate on API error', async () => {
    mockPost.mockRejectedValueOnce({
      response: { data: { error: 'Conflict' } },
    })
    const { result } = renderHook(() => useCreateSite(), { wrapper: withStore })

    fillAdmin(result)
    await act(async () => {
      await result.current.handleSubmit(fakeSubmitEvent())
    })

    expect(mockPush).not.toHaveBeenCalled()
  })
})
