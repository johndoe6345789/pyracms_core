/**
 * Tests for src/hooks/useCreateSite.ts: network errors.
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

describe('handleSubmit – network error', () => {
  it('sets connection error for errors with no response', async () => {
    mockPost.mockRejectedValueOnce(new Error('Network Error'))
    const { result } = renderHook(() => useCreateSite(), { wrapper: withStore })

    fillAdmin(result)
    await act(async () => {
      await result.current.handleSubmit(fakeSubmitEvent())
    })

    expect(result.current.error).toBe('Unable to connect to server')
  })

  it('handles a plain string rejection value', async () => {
    mockPost.mockRejectedValueOnce('timeout')
    const { result } = renderHook(() => useCreateSite(), { wrapper: withStore })

    fillAdmin(result)
    await act(async () => {
      await result.current.handleSubmit(fakeSubmitEvent())
    })

    expect(result.current.error).toBe('Unable to connect to server')
  })
})
