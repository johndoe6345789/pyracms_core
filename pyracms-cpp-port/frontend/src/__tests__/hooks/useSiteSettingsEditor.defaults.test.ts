import { renderHook, act, waitFor } from '@testing-library/react'
import { useSiteSettingsEditor } from '@/hooks/admin/useSiteSettingsEditor'

const fetchSettings = jest.fn()
const putSetting = jest.fn()
jest.mock('@/hooks/admin/settingsApi', () => ({
  fetchSettings: (...a: unknown[]) => fetchSettings(...a),
  putSetting: (...a: unknown[]) => putSetting(...a),
}))

const site = { name: 'Demo Site', description: 'A place to write' }

beforeEach(() => {
  jest.clearAllMocks()
  fetchSettings.mockResolvedValue([])
  putSetting.mockResolvedValue(undefined)
})

describe('useSiteSettingsEditor defaults', () => {
  it('shows the site name and description on a fresh site', async () => {
    const { result } = renderHook(() => useSiteSettingsEditor(4, site))
    await waitFor(() => expect(fetchSettings).toHaveBeenCalled())
    expect(result.current.values.site_name).toBe('Demo Site')
    expect(result.current.values.seo_title).toBe('Demo Site')
    expect(result.current.values.contact_email).toBe('')
  })

  it('takes the defaults once the site arrives', async () => {
    const { result, rerender } = renderHook(
      ({ s }) => useSiteSettingsEditor(4, s),
      { initialProps: { s: null as typeof site | null } },
    )
    expect(result.current.values.site_name).toBe('')
    rerender({ s: site })
    expect(result.current.values.site_name).toBe('Demo Site')
  })

  it('lets the owner clear the name without it snapping back', () => {
    const { result } = renderHook(() => useSiteSettingsEditor(4, site))
    act(() => result.current.setField('site_name', ''))
    expect(result.current.values.site_name).toBe('')
    act(() => result.current.setField('site_name', 'New'))
    expect(result.current.values.site_name).toBe('New')
  })

  it('saves the defaults it shows', async () => {
    const { result } = renderHook(() => useSiteSettingsEditor(4, site))
    await waitFor(() => expect(fetchSettings).toHaveBeenCalled())
    await act(() => result.current.save())
    expect(putSetting).toHaveBeenCalledWith('site_name', 'Demo Site', 4)
    expect(putSetting).toHaveBeenCalledWith('seo_title', 'Demo Site', 4)
  })
})
