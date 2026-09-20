/**
 * Tests for src/hooks/useCreateSite.ts: the admin account gate.
 */

import { renderHook, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import {
  navigationMock,
  apiMock,
  mockPost,
  fakeSubmitEvent,
} from '../helpers/createSiteHook'
import { withStore } from '../helpers/createSiteHook'
import { useCreateSite } from '@/hooks/useCreateSite'

jest.mock('next/navigation', () => navigationMock())
jest.mock('@/lib/api', () => apiMock())

beforeEach(() => {
  jest.clearAllMocks()
})

describe('handleSubmit – admin account', () => {
  it('does not post until the admin details are valid', async () => {
    const { result } = renderHook(() => useCreateSite(), {
      wrapper: withStore,
    })
    act(() => {
      result.current.updateField('name', 'My Blog')
    })
    await act(async () => {
      await result.current.handleSubmit(fakeSubmitEvent())
    })
    expect(mockPost).not.toHaveBeenCalled()
    expect(result.current.error).toMatch(/admin username/i)
  })
})
