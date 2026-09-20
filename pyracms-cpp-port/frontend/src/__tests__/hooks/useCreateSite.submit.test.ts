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
import { withStore, fillAdmin } from '../helpers/createSiteHook'
import { useCreateSite } from '@/hooks/useCreateSite'

jest.mock('next/navigation', () => navigationMock())
jest.mock('@/lib/api', () => apiMock())

beforeEach(() => {
  jest.clearAllMocks()
})

describe('handleSubmit – success', () => {
  it('calls POST /api/sites with the site and its admin', async () => {
    mockPost.mockResolvedValueOnce({
      data: { token: 't', user: { id: 1, username: 'owner' } },
    })
    const { result } = renderHook(() => useCreateSite(), { wrapper: withStore })

    act(() => {
      result.current.updateField('name', 'My Blog')
    })
    act(() => {
      result.current.updateField('description', 'A blog')
    })

    fillAdmin(result)
    await act(async () => {
      await result.current.handleSubmit(fakeSubmitEvent())
    })

    expect(mockPost).toHaveBeenCalledWith('/api/sites', {
      slug: 'my-blog',
      displayName: 'My Blog',
      description: 'A blog',
      admin: {
        username: 'owner',
        email: 'owner@x.io',
        password: 'password123',
      },
    })
  })

  it('opens the new site admin panel on success', async () => {
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

    expect(mockPush).toHaveBeenCalledWith('/site/my-blog/admin')
  })
})
