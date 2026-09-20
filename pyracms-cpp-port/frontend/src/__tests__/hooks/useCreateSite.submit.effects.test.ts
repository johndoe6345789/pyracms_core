/**
 * Tests for src/hooks/useCreateSite.ts: submit side effects.
 */

import { renderHook, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import {
  navigationMock,
  apiMock,
  mockPost,
  fakeSubmitEvent,
  makeMockFormEvent,
} from '../helpers/createSiteHook'
import { withStore, fillAdmin } from '../helpers/createSiteHook'
import { useCreateSite } from '@/hooks/useCreateSite'

jest.mock('next/navigation', () => navigationMock())
jest.mock('@/lib/api', () => apiMock())

beforeEach(() => {
  jest.clearAllMocks()
})

describe('handleSubmit – success', () => {
  it('calls preventDefault on the submit event', async () => {
    mockPost.mockResolvedValueOnce({
      data: { token: 't', user: { id: 1, username: 'owner' } },
    })
    const { result } = renderHook(() => useCreateSite(), { wrapper: withStore })
    const { event, preventDefault } = makeMockFormEvent()

    fillAdmin(result)
    await act(async () => {
      await result.current.handleSubmit(event)
    })

    expect(preventDefault).toHaveBeenCalledTimes(1)
  })

  it('leaves error as empty string after success', async () => {
    mockPost.mockResolvedValueOnce({
      data: { token: 't', user: { id: 1, username: 'owner' } },
    })
    const { result } = renderHook(() => useCreateSite(), { wrapper: withStore })

    act(() => {
      result.current.updateField('name', 'My Blog')
    })

    fillAdmin(result)
    await act(async () => {
      await result.current.handleSubmit(fakeSubmitEvent())
    })

    expect(result.current.error).toBe('')
  })
})
