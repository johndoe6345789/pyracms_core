import { renderHook, act } from '@testing-library/react'
import api from '@/lib/api'
import { useSnippetAttachments } from '@/hooks/useSnippetAttachments'
import { asMockApi } from '../helpers/mockApi'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { post: jest.fn(), delete: jest.fn() },
}))
const m = asMockApi<'post' | 'delete'>(api)
beforeEach(() => {
  m.post.mockReset()
  m.delete.mockReset()
})

const files = (...names: string[]) =>
  names.map((n) => new File(['x'], n)) as unknown as FileList

describe('useSnippetAttachments', () => {
  it('uploads then attaches each file to the snippet', async () => {
    m.post
      .mockResolvedValueOnce({ data: { uuid: 'u1' } })
      .mockResolvedValueOnce({ data: {} })
    const done = jest.fn()
    const { result } = renderHook(() => useSnippetAttachments('7', 9, done))
    await act(() => result.current.upload(files('input.txt')))
    expect(m.post).toHaveBeenNthCalledWith(
      1,
      '/api/files',
      expect.any(FormData),
      expect.anything(),
    )
    expect(m.post).toHaveBeenNthCalledWith(2, '/api/snippets/7/attachments', {
      fileUuid: 'u1',
    })
    expect(done).toHaveBeenCalled()
    expect(result.current.error).toBe('')
  })

  it('reports an upload failure and still calls onDone', async () => {
    m.post.mockRejectedValue({ response: { data: { error: 'Nope' } } })
    const done = jest.fn()
    const { result } = renderHook(() => useSnippetAttachments('7', 9, done))
    await act(() => result.current.upload(files('a.txt')))
    expect(result.current.error).toBe('Nope')
    expect(done).toHaveBeenCalled()
  })

  it('does nothing without a tenant', async () => {
    const { result } = renderHook(() =>
      useSnippetAttachments('7', null, jest.fn()),
    )
    await act(() => result.current.upload(files('a.txt')))
    expect(m.post).not.toHaveBeenCalled()
  })

  it('removes an attachment', async () => {
    m.delete.mockResolvedValue({ data: {} })
    const done = jest.fn()
    const { result } = renderHook(() => useSnippetAttachments('7', 9, done))
    await act(() => result.current.remove(3))
    expect(m.delete).toHaveBeenCalledWith('/api/snippets/7/attachments/3')
    expect(done).toHaveBeenCalled()
  })

  it('reports a remove failure', async () => {
    m.delete.mockRejectedValue({ response: { data: { error: 'No' } } })
    const { result } = renderHook(() =>
      useSnippetAttachments('7', 9, jest.fn()),
    )
    await act(() => result.current.remove(3))
    expect(result.current.error).toBe('No')
  })
})
