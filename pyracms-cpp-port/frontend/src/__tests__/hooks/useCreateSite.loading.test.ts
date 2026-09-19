/**
 * Tests for src/hooks/useCreateSite.ts: the loading flag.
 */

import { renderHook, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import {
  navigationMock,
  apiMock,
  mockPost,
  fakeSubmitEvent,
} from '../helpers/createSiteHook'
import { useCreateSite } from '@/hooks/useCreateSite'

jest.mock('next/navigation', () => navigationMock())
jest.mock('@/lib/api', () => apiMock())

beforeEach(() => {
  jest.clearAllMocks()
})

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
    mockPost.mockRejectedValueOnce({
      response: { data: { error: 'err' } },
    })
    const { result } = renderHook(() => useCreateSite())

    await act(async () => {
      await result.current.handleSubmit(fakeSubmitEvent())
    })

    expect(result.current.loading).toBe(false)
  })
})
