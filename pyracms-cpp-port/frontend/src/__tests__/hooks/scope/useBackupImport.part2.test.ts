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

it('reports failed writes, menus and invalid files', async () => {
  put.mockRejectedValue({ response: { data: { error: 'denied' } } })
  const { result } = renderHook(() => useBackupRestore(7))
  act(() =>
    result.current.handleFileChange(
      change([
        file({
          exportType: 'settings',
          data: { a: '1' },
        }),
      ]),
    ),
  )
  await waitFor(() => expect(result.current.snackbar.severity).toBe('error'))
  act(() =>
    result.current.handleFileChange(
      change([
        file({
          exportType: 'menus',
          data: [],
        }),
      ]),
    ),
  )
  await waitFor(() =>
    expect(result.current.snackbar.message).toMatch(/not available yet/),
  )
  expect(put).toHaveBeenCalledTimes(1)
  act(() =>
    result.current.handleFileChange(change([new File(['{nope'], 'b.json')])),
  )
  await waitFor(() =>
    expect(result.current.snackbar.message).toMatch(/Invalid JSON/),
  )
})
