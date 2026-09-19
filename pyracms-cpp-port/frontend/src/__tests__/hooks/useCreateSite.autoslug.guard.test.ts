/**
 * Tests for src/hooks/useCreateSite.ts: the auto-slug guard.
 */

import { renderHook, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import { navigationMock, apiMock } from '../helpers/createSiteHook'
import { useCreateSite } from '@/hooks/useCreateSite'

jest.mock('next/navigation', () => navigationMock())
jest.mock('@/lib/api', () => apiMock())

beforeEach(() => {
  jest.clearAllMocks()
})

describe('updateField(name) – auto-slug generation', () => {
  it('does not overwrite a manually set slug when name changes', () => {
    const { result } = renderHook(() => useCreateSite())

    // Manually set the slug first
    act(() => {
      result.current.updateField('slug', 'custom-slug')
    })

    // Now update the name – slug must stay 'custom-slug'
    act(() => {
      result.current.updateField('name', 'Totally Different Name')
    })

    expect(result.current.form.slug).toBe('custom-slug')
    expect(result.current.form.name).toBe('Totally Different Name')
  })

  /**
   * Bug-fix regression: previously the auto-slug guard read
   * `form.slug` from the closure (stale value).  After two rapid
   * name updates the second call would always see an empty slug
   * in the closure and overwrite any auto-generated value from
   * the first call.
   *
   * The fix reads `prev.slug` inside the functional updater so it
   * always observes the latest queued state.
   */
  it('uses prev.slug (not stale closure) for the auto-slug guard', () => {
    const { result } = renderHook(() => useCreateSite())

    act(() => {
      // First update: slug is '' → auto-generate 'first-name'
      result.current.updateField('name', 'First Name')
      // Second update inside same act(): the functional updater
      // must see prev.slug = 'first-name' (already set) and NOT
      // overwrite.
      result.current.updateField('name', 'Second Name')
    })

    // The slug should reflect the FIRST auto-generated value; the
    // second name change must not reset it to 'second-name'.
    expect(result.current.form.slug).toBe('first-name')
    expect(result.current.form.name).toBe('Second Name')
  })
})
