import { renderHook, act, waitFor } from '@testing-library/react'
import { useBackupRestore } from '@/hooks/useBackupRestore'
import api from '@/lib/api'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { put: jest.fn() },
}))

const put = api.put as jest.Mock

beforeEach(() => {
  put.mockReset()
})

const change = (files: File[] | undefined) =>
  ({ target: { files, value: 'x' } }) as never

const file = (o: unknown) => new File([JSON.stringify(o)], 'a.json')

it('clicks the hidden input', () => {
  const { result } = renderHook(() => useBackupRestore(1))
  const click = jest.fn()
  ;(result.current.fileInputRef as { current: unknown }).current = { click }
  act(() => result.current.handleImportClick())
  expect(click).toHaveBeenCalled()
  act(() => result.current.handleCloseSnackbar())
  expect(result.current.snackbar.open).toBe(false)
})

it('imports settings by PUTting each one', async () => {
  put.mockResolvedValue({})
  const { result } = renderHook(() => useBackupRestore(7))
  act(() => result.current.handleFileChange(change(undefined)))
  expect(result.current.snackbar.open).toBe(false)
  act(() =>
    result.current.handleFileChange(
      change([
        file({
          exportType: 'settings',
          data: { a: '1', b: '2' },
        }),
      ]),
    ),
  )
  await waitFor(() =>
    expect(result.current.snackbar.message).toMatch(/Imported 2 settings/),
  )
  expect(put).toHaveBeenCalledWith(
    '/api/settings/a?tenant_id=7',
    expect.objectContaining({ name: 'a', value: '1' }),
  )
})
