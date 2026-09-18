import { renderHook, waitFor, act } from '@testing-library/react'
import api from '@/lib/api'
import { useFeatureToggles } from '@/hooks/useFeatureToggles'
import { asMockApi } from '../helpers/mockApi'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { get: jest.fn(), put: jest.fn() },
}))
const mock = asMockApi<'get' | 'put'>(api)

beforeEach(() => {
  mock.get.mockReset()
  mock.put.mockReset().mockResolvedValue({})
})

it('starts disabled and skips without tenant', () => {
  const { result } = renderHook(() => useFeatureToggles(null))
  expect(result.current.features).toHaveLength(5)
  expect(result.current.features.every(f => !f.enabled)).toBe(true)
  act(() => result.current.handleSave())
  expect(mock.put).not.toHaveBeenCalled()
})

it('loads flags, toggles, saves and closes snackbar', async () => {
  mock.get.mockResolvedValue({
    data: [
      { name: 'feature_forum', value: 'true' },
      { name: 'feature_gallery', value: 'false' },
      { name: 5, value: 'true' },
      { name: 'other', value: 'true' },
    ],
  })
  const { result } = renderHook(() => useFeatureToggles(1))
  await waitFor(() => expect(result.current.loading).toBe(false))
  const on = result.current.features.filter(f => f.enabled)
  expect(on.map(f => f.id)).toEqual(['forum'])
  act(() => result.current.handleToggle('articles'))
  expect(result.current.features[0]!.enabled).toBe(true)
  act(() => result.current.handleSave())
  await waitFor(() => expect(result.current.snackbarOpen).toBe(true))
  expect(mock.put).toHaveBeenCalledTimes(5)
  expect(mock.put).toHaveBeenCalledWith(
    '/api/settings/feature_articles?tenant_id=1',
    { name: 'feature_articles', value: 'true' },
  )
  act(() => result.current.handleCloseSnackbar())
  expect(result.current.snackbarOpen).toBe(false)
})

it('handles empty data and failures', async () => {
  mock.get.mockResolvedValue({ data: null })
  const a = renderHook(() => useFeatureToggles(1))
  await waitFor(() => expect(a.result.current.loading).toBe(false))
  mock.get.mockRejectedValue(new Error('x'))
  const b = renderHook(() => useFeatureToggles(2))
  await waitFor(() => expect(b.result.current.loading).toBe(false))
  mock.put.mockRejectedValue(new Error('x'))
  act(() => b.result.current.handleSave())
  await waitFor(() => expect(mock.put).toHaveBeenCalled())
  expect(b.result.current.snackbarOpen).toBe(false)
})
