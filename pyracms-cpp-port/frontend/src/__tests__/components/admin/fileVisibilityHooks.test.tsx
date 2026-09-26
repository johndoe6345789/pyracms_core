import '../../helpers/scopeModuleMocks'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useFileVisibility } from '@/hooks/admin/useFileVisibility'
import { useFileLink } from '@/hooks/admin/useFileLink'
import type { FileItem } from '@/hooks/admin/fileData'
import { m } from '../../helpers/scopeApi'

const file = (visibility: 'public' | 'authenticated'): FileItem => ({
  id: 1,
  name: 'pic.png',
  size: 10,
  type: 'image/png',
  downloads: 0,
  uploadedAt: '2024-01-01',
  uuid: 'u-vis',
  visibility,
})

beforeEach(() => {
  jest.resetAllMocks()
  m.put.mockResolvedValue({})
})

it('changing visibility updates the file and reports failures', async () => {
  let files = [file('public')]
  const set = jest.fn((f: (p: FileItem[]) => FileItem[]) => {
    files = f(files)
  })
  const { result } = renderHook(() => useFileVisibility(set as never))
  act(() => result.current.setVisibility(files[0]!, 'authenticated'))
  await waitFor(() => expect(files[0]?.visibility).toBe('authenticated'))
  expect(m.put).toHaveBeenCalledWith('/api/files/u-vis/visibility', {
    visibility: 'authenticated',
  })
  m.put.mockRejectedValueOnce({ response: { data: { error: 'no' } } })
  act(() => result.current.setVisibility(files[0]!, 'public'))
  await waitFor(() => expect(result.current.visibilityError).toBe('no'))
  expect(files[0]?.visibility).toBe('authenticated')
})

it('a failed link keeps waiting; public files never ask', async () => {
  m.post.mockRejectedValue(new Error('x'))
  const locked = renderHook(() => useFileLink('u-fail', 'authenticated'))
  await waitFor(() => expect(m.post).toHaveBeenCalled())
  expect(locked.result.current.ready).toBe(false)
  m.post.mockClear()
  const open = renderHook(() => useFileLink('u-open', 'public'))
  expect(open.result.current).toEqual({ query: '', ready: true })
  expect(m.post).not.toHaveBeenCalled()
})
