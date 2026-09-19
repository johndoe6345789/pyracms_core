/**
 * Tests for src/hooks/useCreateSite.ts: successful submit.
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
import { useCreateSite } from '@/hooks/useCreateSite'

jest.mock('next/navigation', () => navigationMock())
jest.mock('@/lib/api', () => apiMock())

beforeEach(() => {
  jest.clearAllMocks()
})

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
})
