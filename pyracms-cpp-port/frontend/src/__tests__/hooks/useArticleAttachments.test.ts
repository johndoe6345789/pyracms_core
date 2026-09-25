import { renderHook, act, waitFor } from '@testing-library/react'
import api from '@/lib/api'
import { useArticleAttachments } from '@/hooks/useArticleAttachments'
import { asMockApi } from '../helpers/mockApi'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), delete: jest.fn() },
}))
const m = asMockApi<'get' | 'post' | 'delete'>(api)
const files = (...names: string[]) =>
  names.map((n) => new File(['x'], n)) as unknown as FileList
const row = { id: 3, fileUuid: 'u', filename: 'a.zip', size: 9 }

beforeEach(() => {
  m.get.mockReset().mockResolvedValue({ data: [row] })
  m.post.mockReset()
  m.delete.mockReset()
})

it('loads the article downloads', async () => {
  const { result } = renderHook(() => useArticleAttachments('my art', 4))
  await waitFor(() => expect(result.current.items).toHaveLength(1))
  expect(m.get).toHaveBeenCalledWith(
    '/api/articles/my%20art/attachments?tenant_id=4',
  )
  expect(result.current.items[0]?.filename).toBe('a.zip')
})

it('shows nothing when the list fails and waits for a tenant', async () => {
  m.get.mockRejectedValue(new Error('x'))
  const { result } = renderHook(() => useArticleAttachments('a', 4))
  await waitFor(() => expect(m.get).toHaveBeenCalled())
  expect(result.current.items).toEqual([])
  renderHook(() => useArticleAttachments('a', null))
  expect(m.get).toHaveBeenCalledTimes(1)
})

it('uploads then attaches, and reloads', async () => {
  m.post
    .mockResolvedValueOnce({ data: { uuid: 'u9' } })
    .mockResolvedValueOnce({ data: {} })
  const { result } = renderHook(() => useArticleAttachments('a', 4))
  await act(() => result.current.upload(files('f.txt')))
  expect(m.post).toHaveBeenNthCalledWith(2, '/api/articles/a/attachments', {
    fileUuid: 'u9',
    tenant_id: 4,
  })
  expect(m.get.mock.calls.length).toBeGreaterThan(1)
  expect(result.current.error).toBe('')
})

it('reports failures and does nothing without a tenant', async () => {
  m.post.mockRejectedValue({ response: { data: { error: 'Nope' } } })
  const { result } = renderHook(() => useArticleAttachments('a', 4))
  await act(() => result.current.upload(files('f.txt')))
  expect(result.current.error).toBe('Nope')
  m.post.mockClear()
  const none = renderHook(() => useArticleAttachments('a', null))
  await act(() => none.result.current.upload(files('f.txt')))
  expect(m.post).not.toHaveBeenCalled()
})

it('removes one attachment', async () => {
  m.delete.mockResolvedValue({ data: {} })
  const { result } = renderHook(() => useArticleAttachments('a', 4))
  await act(() => result.current.remove(3))
  expect(m.delete).toHaveBeenCalledWith(
    '/api/articles/a/attachments/3?tenant_id=4',
  )
  m.delete.mockRejectedValue(new Error('x'))
  await act(() => result.current.remove(3))
  expect(result.current.error).not.toBe('')
})
