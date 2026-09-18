import { renderHook, act, waitFor } from '@testing-library/react'
import { useBackupRestore } from '@/hooks/useBackupRestore'
import { buildMenusPayload, parseImport } from '@/hooks/admin/backupPayloads'

beforeAll(() => {
  URL.createObjectURL = jest.fn(() => 'blob:x')
  URL.revokeObjectURL = jest.fn()
  jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation()
})

const change = (files: File[] | undefined) =>
  ({ target: { files, value: 'x' } }) as never

it('exports settings and menus', () => {
  const { result } = renderHook(() => useBackupRestore())
  act(() => result.current.handleExportSettings())
  expect(result.current.snackbar.message).toMatch(/Settings/)
  act(() => result.current.handleExportMenus())
  expect(result.current.snackbar.message).toMatch(/Menus/)
  act(() => result.current.handleCloseSnackbar())
  expect(result.current.snackbar.open).toBe(false)
})

it('clicks the hidden input', () => {
  const { result } = renderHook(() => useBackupRestore())
  const click = jest.fn()
  ;(result.current.fileInputRef as { current: unknown }).current = { click }
  act(() => result.current.handleImportClick())
  expect(click).toHaveBeenCalled()
})

it('imports valid, invalid and empty files', async () => {
  const { result } = renderHook(() => useBackupRestore())
  act(() => result.current.handleFileChange(change(undefined)))
  expect(result.current.snackbar.open).toBe(false)
  const ok = new File([JSON.stringify(buildMenusPayload())], 'a.json')
  act(() => result.current.handleFileChange(change([ok])))
  await waitFor(() => expect(result.current.snackbar.message)
    .toMatch(/Successfully imported menus/))
  const bad = new File(['{nope'], 'b.json')
  act(() => result.current.handleFileChange(change([bad])))
  await waitFor(() => expect(result.current.snackbar.severity)
    .toBe('warning'))
})

it('rejects malformed exports', () => {
  expect(() => parseImport('{}')).toThrow('Invalid format')
})
