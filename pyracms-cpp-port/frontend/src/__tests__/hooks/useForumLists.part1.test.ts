import { renderHook, waitFor } from '@testing-library/react'
import api from '@/lib/api'
import { useForumCategories } from '@/hooks/useForumCategories'
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
