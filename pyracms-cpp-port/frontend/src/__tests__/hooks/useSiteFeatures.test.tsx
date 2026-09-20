import { renderHook, act, waitFor } from '@testing-library/react'
import {
  useSiteFeatures,
  publishSiteFeatures,
  clearSiteFeaturesCache,
} from '@/hooks/useSiteFeatures'
import { ALL_ON } from '@/lib/siteFeatures'
import { m } from '../helpers/scopeApi'

jest.mock('@/lib/api', () => jest.requireActual('../helpers/apiMock').apiMock)

let slug = 0
const nextSlug = () => `site-${++slug}`
const tenantAndSettings = (id: number, settings: unknown) =>
  m.get.mockImplementation((url: string) =>
    Promise.resolve({
      data: url.startsWith('/api/tenants/') ? { id } : settings,
    }),
  )
const settingsCalls = () =>
  m.get.mock.calls.filter((c) => /settings/.test(c[0])).length

beforeEach(() => {
  jest.resetAllMocks()
  clearSiteFeaturesCache()
})

it('reads flags with missing settings enabled', async () => {
  tenantAndSettings(11, [{ name: 'feature_forum', value: 'false' }])
  const { result } = renderHook(() => useSiteFeatures(nextSlug()))
  expect(result.current.loading).toBe(true)
  expect(result.current.isOn('forum')).toBe(true)
  await waitFor(() => expect(result.current.loading).toBe(false))
  expect(result.current.isOn('forum')).toBe(false)
  expect(result.current.isOn('articles')).toBe(true)
  expect(m.get).toHaveBeenCalledWith('/api/settings?tenant_id=11')
})

it('serves a second mount from the cache', async () => {
  tenantAndSettings(12, [])
  const s = nextSlug()
  const a = renderHook(() => useSiteFeatures(s))
  await waitFor(() => expect(a.result.current.loading).toBe(false))
  const before = settingsCalls()
  const b = renderHook(() => useSiteFeatures(s))
  expect(b.result.current.flags).toEqual(ALL_ON)
  expect(settingsCalls()).toBe(before)
})

it('stays enabled when the lookup fails', async () => {
  m.get.mockImplementation((url: string) =>
    url.startsWith('/api/tenants/')
      ? Promise.resolve({ data: { id: 13 } })
      : Promise.reject(new Error('down')),
  )
  const { result } = renderHook(() => useSiteFeatures(nextSlug()))
  await waitFor(() => expect(result.current.loading).toBe(false))
  expect(result.current.isOn('gallery')).toBe(true)
})

it('handles null data and follows published changes', async () => {
  tenantAndSettings(14, null)
  const { result } = renderHook(() => useSiteFeatures(nextSlug()))
  await waitFor(() => expect(result.current.loading).toBe(false))
  act(() => publishSiteFeatures(14, { ...ALL_ON, hypernucleus: false }))
  expect(result.current.isOn('hypernucleus')).toBe(false)
})
