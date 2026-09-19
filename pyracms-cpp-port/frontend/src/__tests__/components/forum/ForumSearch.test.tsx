import { waitFor, renderHook, act } from '@testing-library/react'
import api from '@/lib/api'
import { useForumSearch } from '@/components/forum/useForumSearch'
import { asMockApi } from '../../helpers/mockApi'
import { items } from '../../helpers/forumSearchItems'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { get: jest.fn() },
}))
const mock = asMockApi<'get'>(api)
beforeEach(() => mock.get.mockReset())

describe('useForumSearch', () => {
  it('filters by author and forum', async () => {
    mock.get.mockResolvedValue({ data: { items } })
    const { result } = renderHook(() => useForumSearch(3))
    act(() => result.current.search('q', 'ann', 'Tech'))
    await waitFor(() => expect(result.current.hasSearched).toBe(true))
    expect(mock.get).toHaveBeenCalledWith(
      '/api/search?q=q&tenant_id=3&type=forum_post',
    )
    expect(result.current.results.map((x) => x.id)).toEqual(['1'])
    expect(result.current.results[0]!.threadId).toBe('')
  })
  it('accepts array data and tolerates errors', async () => {
    mock.get.mockResolvedValueOnce({ data: items })
    const { result } = renderHook(() => useForumSearch())
    act(() => result.current.search('', '', ''))
    await waitFor(() => expect(result.current.results).toHaveLength(2))
    expect(result.current.results[1]!.date).toBe('')
    mock.get.mockRejectedValueOnce(new Error('x'))
    act(() => result.current.search('q', '', ''))
    await waitFor(() => expect(result.current.results).toHaveLength(0))
  })
})
