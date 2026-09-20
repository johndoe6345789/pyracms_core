import { renderHook, act, waitFor } from '@testing-library/react'
import { useFeatureToggles } from '@/hooks/useFeatureToggles'
import { m } from '../../helpers/scopeApi'

jest.mock(
  '@/lib/api',
  () => jest.requireActual('../../helpers/apiMock').apiMock,
)

beforeEach(() => jest.resetAllMocks())

it('loads, toggles, saves', async () => {
  m.get.mockResolvedValue({
    data: [{ name: 'feature_forum', value: 'true' }, { name: 'other' }, {}],
  })
  m.put.mockResolvedValue({})
  const { result } = renderHook(() => useFeatureToggles(1))
  await waitFor(() => expect(result.current.loading).toBe(false))
  expect(result.current.features.find((f) => f.id === 'forum')!.enabled).toBe(
    true,
  )
  act(() => result.current.handleToggle('articles'))
  act(() => result.current.handleSave())
  await waitFor(() => expect(result.current.snackbarOpen).toBe(true))
  expect(m.put).toHaveBeenCalledTimes(5)
  act(() => result.current.handleCloseSnackbar())
  expect(result.current.snackbarOpen).toBe(false)
})

it('handles errors, null data and no tenant', async () => {
  m.get.mockResolvedValue({ data: null })
  m.put.mockRejectedValue(new Error('x'))
  const a = renderHook(() => useFeatureToggles(1))
  await waitFor(() => expect(a.result.current.loading).toBe(false))
  act(() => a.result.current.handleSave())
  await Promise.resolve()
  expect(a.result.current.snackbarOpen).toBe(false)
  m.get.mockRejectedValue(new Error('x'))
  const b = renderHook(() => useFeatureToggles(1))
  await waitFor(() => expect(b.result.current.loading).toBe(false))
  const c = renderHook(() => useFeatureToggles(null))
  act(() => c.result.current.handleSave())
})

it('treats a missing setting as enabled and "false" as off', async () => {
  m.get.mockResolvedValue({
    data: [{ name: 'feature_forum', value: 'false' }],
  })
  const { result } = renderHook(() => useFeatureToggles(1))
  await waitFor(() => expect(result.current.loading).toBe(false))
  const on = (id: string) =>
    result.current.features.find((f) => f.id === id)!.enabled
  expect(on('forum')).toBe(false)
  expect(on('articles')).toBe(true)
  expect(on('hypernucleus')).toBe(true)
})

it('starts enabled before the settings arrive', () => {
  m.get.mockReturnValue(new Promise(() => {}))
  const { result } = renderHook(() => useFeatureToggles(1))
  expect(result.current.features.every((f) => f.enabled)).toBe(true)
})
