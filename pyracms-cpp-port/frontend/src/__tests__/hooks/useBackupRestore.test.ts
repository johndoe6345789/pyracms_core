import { renderHook, act, waitFor } from '@testing-library/react'
import { useBackupRestore } from '@/hooks/useBackupRestore'

beforeAll(() => {
  URL.createObjectURL = jest.fn(() => 'blob:x')
  URL.revokeObjectURL = jest.fn()
})

function pick(result: { current: ReturnType<typeof useBackupRestore> },
  text: string) {
  const file = new File([text], 'in.json')
  const target = { files: [file], value: 'x' }
  act(() => {
    result.current.handleFileChange({ target } as never)
  })
  return target
}

it('exports settings and menus as downloads', () => {
  const click = jest
    .spyOn(HTMLAnchorElement.prototype, 'click')
    .mockImplementation(() => {})
  const { result } = renderHook(() => useBackupRestore())
  act(() => result.current.handleExportSettings())
  expect(result.current.snackbar.message).toMatch(/Settings exported/)
  act(() => result.current.handleExportMenus())
  expect(result.current.snackbar.message).toMatch(/Menus exported/)
  expect(click).toHaveBeenCalledTimes(2)
  act(() => result.current.handleCloseSnackbar())
  expect(result.current.snackbar.open).toBe(false)
  click.mockRestore()
})

it('clicks the hidden input', () => {
  const { result } = renderHook(() => useBackupRestore())
  const input = document.createElement('input')
  const click = jest.spyOn(input, 'click')
  ;(result.current.fileInputRef as { current: unknown }).current = input
  act(() => result.current.handleImportClick())
  expect(click).toHaveBeenCalled()
})

it('imports a valid file', async () => {
  const { result } = renderHook(() => useBackupRestore())
  const target = pick(result, '{"exportType":"menus","data":[]}')
  await waitFor(() => expect(result.current.snackbar.open).toBe(true))
  expect(result.current.snackbar.message).toBe(
    'Successfully imported menus data.')
  expect(target.value).toBe('')
})

it('warns on invalid files and ignores empty selection', async () => {
  const { result } = renderHook(() => useBackupRestore())
  pick(result, '{"nope":1}')
  await waitFor(() =>
    expect(result.current.snackbar.severity).toBe('warning'))
  act(() => {
    result.current.handleFileChange({ target: {} } as never)
  })
  expect(result.current.snackbar.severity).toBe('warning')
})
