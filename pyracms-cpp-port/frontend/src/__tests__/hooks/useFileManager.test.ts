import { renderHook, waitFor, act } from '@testing-library/react'
import api from '@/lib/api'
import { useFileManager, formatFileSize } from '@/hooks/useFileManager'
import { asMockApi } from '../helpers/mockApi'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), delete: jest.fn() },
}))
const mock = asMockApi<'get' | 'post' | 'delete'>(api)
const rec = {
  id: 1, filename: 'a.png', size: 5, mimetype: 'image/png',
  downloadCount: 2, createdAt: '2024-03-04T00:00', uuid: 'u1',
}

async function setup(tenant: number | null = 1) {
  const h = renderHook(() => useFileManager(tenant))
  await waitFor(() => expect(h.result.current.loading).toBe(false))
  return h
}

beforeEach(() => {
  mock.get.mockReset().mockResolvedValue({ data: [rec, { id: 2 }] })
  mock.post.mockReset().mockResolvedValue({ data: { id: 9 } })
  mock.delete.mockReset().mockResolvedValue({})
})

it('formats sizes', () => {
  expect(formatFileSize(10)).toBe('10 B')
  expect(formatFileSize(2048)).toBe('2.0 KB')
  expect(formatFileSize(3 * 1048576)).toBe('3.0 MB')
})

it('loads and maps files', async () => {
  const { result } = await setup()
  expect(result.current.files[0]).toEqual({
    id: 1, name: 'a.png', size: 5, type: 'image/png',
    downloads: 2, uploadedAt: '2024-03-04', uuid: 'u1',
  })
  expect(result.current.files[1]!.uploadedAt).toBe('')
})

it('skips without tenant and tolerates errors', async () => {
  const a = renderHook(() => useFileManager(null))
  act(() => a.result.current.uploadFiles([new File([''], 'x')] as never))
  expect(mock.get).not.toHaveBeenCalled()
  expect(mock.post).not.toHaveBeenCalled()
  mock.get.mockRejectedValue(new Error('x'))
  const b = await setup()
  expect(b.result.current.files).toEqual([])
  mock.get.mockResolvedValue({ data: null })
  const c = await setup()
  expect(c.result.current.files).toEqual([])
})

it('cancels and confirms delete', async () => {
  const { result } = await setup()
  act(() => result.current.handleDeleteConfirm())
  expect(mock.delete).not.toHaveBeenCalled()
  act(() => result.current.handleDeleteClick(result.current.files[0]!))
  expect(result.current.deleteDialogOpen).toBe(true)
  act(() => result.current.handleDeleteCancel())
  expect(result.current.selectedFile).toBeNull()
  act(() => result.current.handleDeleteClick(result.current.files[0]!))
  act(() => result.current.handleDeleteConfirm())
  await waitFor(() => expect(result.current.files).toHaveLength(1))
  expect(mock.delete).toHaveBeenCalledWith('/api/files/u1')
})

it('uploads via uploadFiles with fallbacks', async () => {
  const { result } = await setup()
  const f = new File(['abc'], 'n.txt', { type: 'text/plain' })
  act(() => result.current.uploadFiles([f] as never))
  await waitFor(() => expect(result.current.files).toHaveLength(3))
  expect(result.current.files[2]).toMatchObject({
    id: 9, name: 'n.txt', size: 3, type: 'text/plain', uuid: '',
  })
  mock.post.mockRejectedValue(new Error('x'))
  act(() => result.current.uploadFiles([f] as never))
  await waitFor(() => expect(mock.post).toHaveBeenCalledTimes(2))
})

it('handles drag and drop', async () => {
  const { result } = await setup()
  const preventDefault = jest.fn()
  act(() => result.current.handleDragOver({ preventDefault } as never))
  expect(result.current.dragOver).toBe(true)
  act(() => result.current.handleDragLeave())
  expect(result.current.dragOver).toBe(false)
  const f = new File(['a'], 'a.txt')
  const drop = (files: unknown[]) => ({
    preventDefault, dataTransfer: { files },
  }) as never
  act(() => result.current.handleDrop(drop([])))
  expect(mock.post).not.toHaveBeenCalled()
  act(() => result.current.handleDrop(drop([f])))
  await waitFor(() => expect(mock.post).toHaveBeenCalledTimes(1))
})
