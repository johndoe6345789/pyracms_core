import { renderHook, act } from '@testing-library/react'
import { useBackupRestore } from '@/hooks/useBackupRestore'
import api from '@/lib/api'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { get: jest.fn(), put: jest.fn() },
}))
const get = api.get as jest.Mock
const put = api.put as jest.Mock
let saved: unknown

beforeEach(() => {
  get.mockReset()
  put.mockReset()
  saved = undefined
  URL.createObjectURL = jest.fn((b: Blob) => {
    saved = b
    return 'b:x'
  })
  URL.revokeObjectURL = jest.fn()
  jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation()
})

const readBlob = (b: Blob) =>
  new Promise<string>((res) => {
    const r = new FileReader()
    r.onload = () => res(r.result as string)
    r.readAsText(b)
  })

it('exports the real tenant settings', async () => {
  get.mockResolvedValue({ data: [{ id: 1, name: 'k', value: 'v' }] })
  const { result } = renderHook(() => useBackupRestore(7))
  await act(() => result.current.handleExportSettings())
  expect(get).toHaveBeenCalledWith('/api/settings?tenant_id=7')
  const text = await readBlob(saved as Blob)
  expect(JSON.parse(text).data).toEqual({ k: 'v' })
  expect(result.current.snackbar.message).toMatch(/Settings/)
})

it('exports menu groups with their items', async () => {
  get.mockImplementation((u: string) =>
    Promise.resolve({
      data: u.includes('items')
        ? [{ id: 2, name: 'Home', route: '/' }]
        : [{ id: 1, name: 'main' }],
    }),
  )
  const { result } = renderHook(() => useBackupRestore(7))
  await act(() => result.current.handleExportMenus())
  const out = JSON.parse(await readBlob(saved as Blob))
  expect(out.data[0].name).toBe('main')
  expect(out.data[0].items[0].route).toBe('/')
})

it('does not export or fake success on failure or no tenant', async () => {
  get.mockRejectedValue({ response: { data: { error: 'nope' } } })
  const { result } = renderHook(() => useBackupRestore(7))
  await act(() => result.current.handleExportSettings())
  expect(result.current.snackbar).toMatchObject({
    severity: 'error',
    message: 'nope',
  })
  expect(saved).toBeUndefined()
  const r2 = renderHook(() => useBackupRestore(null))
  await act(() => r2.result.current.handleExportMenus())
  expect(r2.result.current.snackbar.severity).toBe('warning')
})
