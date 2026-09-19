import { renderHook, waitFor } from '@testing-library/react'
import api from '@/lib/api'
import { useForumCategories } from '@/hooks/useForumCategories'
import { useThreadList } from '@/hooks/useThreadList'
import { asMockApi } from '../helpers/mockApi'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { get: jest.fn() },
}))
const mock = asMockApi<'get'>(api)

beforeEach(() => mock.get.mockReset())

describe('useForumCategories', () => {
  it('does nothing without a tenant', () => {
    renderHook(() => useForumCategories(null))
    expect(mock.get).not.toHaveBeenCalled()
  })
  it('maps categories and forums', async () => {
    mock.get.mockResolvedValue({
      data: [
        {
          id: 1,
          name: 'Gen',
          forums: [{ id: 2, name: 'Chat', totalThreads: 3 }],
        },
        { id: 9, name: 'Empty' },
      ],
    })
    const { result } = renderHook(() => useForumCategories(7))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(mock.get).toHaveBeenCalledWith('/api/forum/categories?tenant_id=7')
    expect(result.current.categories[0]!.forums[0]).toEqual({
      id: '2',
      name: 'Chat',
      description: '',
      threads: 3,
      posts: 0,
    })
    expect(result.current.categories[1]!.forums).toEqual([])
  })
  it('tolerates non-array data and reports errors', async () => {
    mock.get.mockResolvedValueOnce({ data: {} })
    const ok = renderHook(() => useForumCategories(1))
    await waitFor(() => expect(ok.result.current.loading).toBe(false))
    expect(ok.result.current.categories).toEqual([])
    mock.get.mockRejectedValueOnce(new Error('x'))
    const bad = renderHook(() => useForumCategories(1))
    await waitFor(() => expect(bad.result.current.error).not.toBe(''))
  })
})

describe('useThreadList', () => {
  it('skips loading without ids', () => {
    renderHook(() => useThreadList('', 1))
    expect(mock.get).not.toHaveBeenCalled()
  })
  it('maps threads', async () => {
    mock.get.mockResolvedValue({
      data: {
        name: 'F',
        description: 'D',
        threads: [
          { id: 5, totalPosts: 4, lastPostAt: '2024-01-01T10:00:00' },
          { id: 6, totalPosts: 0, pinned: true, locked: true },
        ],
      },
    })
    const { result } = renderHook(() => useThreadList('2', 1))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.forum).toEqual({ name: 'F', description: 'D' })
    expect(result.current.threads[0]).toMatchObject({
      id: '5',
      title: '(untitled)',
      author: 'Unknown',
      replies: 3,
      lastPostDate: '2024-01-01 10:00',
    })
    expect(result.current.threads[1]).toMatchObject({
      replies: 0,
      pinned: true,
      locked: true,
    })
  })
  it('distinguishes 404 from other errors', async () => {
    mock.get.mockRejectedValueOnce({ response: { status: 404 } })
    const a = renderHook(() => useThreadList('2', 1))
    await waitFor(() => expect(a.result.current.error).toMatch(/not exist/))
    mock.get.mockRejectedValueOnce(new Error('x'))
    const b = renderHook(() => useThreadList('2', 1))
    await waitFor(() => expect(b.result.current.error).toMatch(/Could not/))
  })
})
