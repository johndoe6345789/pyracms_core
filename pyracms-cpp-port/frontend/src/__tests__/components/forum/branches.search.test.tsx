import { renderHook, act, waitFor } from '@testing-library/react'
import { useForumSearch } from '@/components/forum/useForumSearch'
import api from '@/lib/api'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { get: jest.fn() },
}))
const get = api.get as jest.Mock
beforeEach(() => get.mockReset())

describe('useForumSearch fallbacks', () => {
  it('fills blanks for sparse rows', async () => {
    get.mockResolvedValue({
      data: {
        items: [
          { id: 1 },
          { id: 2, snippet: 's', createdAt: '2024-05-06T10:00:00Z' },
        ],
      },
    })
    const { result } = renderHook(() => useForumSearch())
    act(() => result.current.search('q', '', ''))
    await waitFor(() => expect(result.current.results).toHaveLength(2))
    expect(result.current.results[0]).toMatchObject({
      threadTitle: '',
      postContent: '',
      author: '',
      forumName: '',
    })
    expect(result.current.results[1]).toMatchObject({
      postContent: 's',
      date: '2024-05-06',
    })
  })

  it('accepts a null payload', async () => {
    get.mockResolvedValue({ data: { items: null } })
    const { result } = renderHook(() => useForumSearch(2))
    act(() => result.current.search('', '', ''))
    await waitFor(() => expect(result.current.hasSearched).toBe(true))
  })
})
