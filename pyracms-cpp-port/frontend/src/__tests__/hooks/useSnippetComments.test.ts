import { renderHook, waitFor, act } from '@testing-library/react'
import api from '@/lib/api'
import { useSnippetComments } from '@/hooks/useSnippetComments'
import { useSnippetActions } from '@/hooks/useSnippetActions'
import { asMockApi } from '../helpers/mockApi'

const push = jest.fn()
jest.mock('next/navigation', () => ({ useRouter: () => ({ push }) }))
jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), delete: jest.fn() },
}))
const mock = asMockApi<'get' | 'post' | 'delete'>(api)

beforeEach(() => {
  Object.values(mock).forEach((m) => m.mockReset())
  push.mockClear()
})

describe('useSnippetComments', () => {
  it('loads and maps comments', async () => {
    mock.get.mockResolvedValue({ data: [{
      id: 1, username: 'ann', body: 'hi', createdAt: '2024-01-01T10:00:00',
    }, { id: 2 }] })
    const { result } = renderHook(() => useSnippetComments('4'))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(mock.get).toHaveBeenCalledWith('/api/comments/snippet/4')
    expect(result.current.comments[0]).toEqual({
      id: '1', author: 'ann', body: 'hi', date: '2024-01-01 10:00',
    })
    expect(result.current.comments[1]!.author).toBe('Unknown')
  })
  it('reports load failures', async () => {
    mock.get.mockRejectedValue(new Error('x'))
    const { result } = renderHook(() => useSnippetComments('4'))
    await waitFor(() => expect(result.current.error).toMatch(/load/))
  })
  it('posts and reloads, or reports failure', async () => {
    mock.get.mockResolvedValue({ data: {} })
    mock.post.mockResolvedValueOnce({})
    const { result } = renderHook(() => useSnippetComments('4'))
    await waitFor(() => expect(result.current.loading).toBe(false))
    let ok = false
    await act(async () => { ok = await result.current.post('yo') })
    expect(ok).toBe(true)
    expect(mock.post).toHaveBeenCalledWith('/api/comments/snippet/4', {
      body: 'yo',
    })
    mock.post.mockRejectedValueOnce({ response: { status: 401 } })
    await act(async () => { ok = await result.current.post('yo') })
    expect(ok).toBe(false)
    expect(result.current.error).toMatch(/Log in/)
    mock.post.mockRejectedValueOnce(new Error('x'))
    await act(async () => { await result.current.post('yo') })
    expect(result.current.error).toMatch(/Could not post/)
  })
})

describe('useSnippetActions', () => {
  it('forks and deletes with navigation', async () => {
    mock.post.mockResolvedValue({ data: { id: 9 } })
    mock.delete.mockResolvedValue({})
    const { result } = renderHook(() => useSnippetActions('4', '/b', 1))
    act(() => result.current.fork())
    await waitFor(() => expect(push).toHaveBeenCalledWith('/b/9'))
    act(() => result.current.remove())
    await waitFor(() => expect(push).toHaveBeenCalledWith('/b'))
  })
  it('reports failures', async () => {
    mock.post.mockRejectedValue(new Error('x'))
    mock.delete.mockRejectedValue(new Error('x'))
    const { result } = renderHook(() => useSnippetActions('4', '/b', 1))
    act(() => result.current.fork())
    await waitFor(() => expect(result.current.error).toMatch(/fork/))
    act(() => result.current.remove())
    await waitFor(() => expect(result.current.error).toMatch(/delete/))
  })
})
