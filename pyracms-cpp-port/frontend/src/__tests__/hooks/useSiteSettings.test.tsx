import { renderHook, waitFor, act } from '@testing-library/react'
import { useSiteSettings, announceSiteSettings } from '@/hooks/useSiteSettings'
import { SITE_SETTING_DEFAULTS } from '@/lib/siteSettings'
import { m } from '../helpers/scopeApi'

jest.mock('@/lib/api', () => jest.requireActual('../helpers/apiMock').apiMock)
jest.mock(
  '@/hooks/useTenantId',
  () => jest.requireActual('../helpers/scopeMocks').tenantMock,
)

beforeEach(() => jest.resetAllMocks())

it('reads the public settings once, then follows announcements', async () => {
  m.get.mockResolvedValue({ data: [{ name: 'site_name', value: 'A' }] })
  const { result } = renderHook(() => useSiteSettings('one'))
  expect(result.current).toBeNull()
  await waitFor(() => expect(result.current?.site_name).toBe('A'))
  act(() =>
    announceSiteSettings('one', { ...SITE_SETTING_DEFAULTS, site_name: 'B' }),
  )
  expect(result.current?.site_name).toBe('B')
  act(() => announceSiteSettings('other', SITE_SETTING_DEFAULTS))
  expect(result.current?.site_name).toBe('B')
  const again = renderHook(() => useSiteSettings('one'))
  expect(again.result.current?.site_name).toBe('B')
  expect(m.get).toHaveBeenCalledTimes(1)
})

it('stays null on a failed read and without a slug', async () => {
  m.get.mockRejectedValue(new Error('x'))
  const { result } = renderHook(() => useSiteSettings('two'))
  await waitFor(() => expect(m.get).toHaveBeenCalled())
  expect(result.current).toBeNull()
  expect(renderHook(() => useSiteSettings(null)).result.current).toBeNull()
})
