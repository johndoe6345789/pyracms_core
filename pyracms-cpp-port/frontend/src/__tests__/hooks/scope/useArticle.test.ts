import { renderHook, act, waitFor } from '@testing-library/react'
import { useArticle } from '@/hooks/useArticle'
import { formatDay, formatDateTime } from '@/hooks/articleDate'
import { m } from '../../helpers/scopeApi'

jest.mock(
  '@/lib/api',
  () => jest.requireActual('../../helpers/apiMock').apiMock,
)

beforeEach(() => jest.resetAllMocks())

it('loads, defaults and votes', async () => {
  m.get.mockResolvedValue({ data: { name: 'n' } })
  m.post.mockResolvedValue({})
  const { result } = renderHook(() => useArticle('n', 1))
  await waitFor(() => expect(result.current.loading).toBe(false))
  expect(result.current.article).toMatchObject({
    title: 'n',
    author: 'Unknown',
    renderer: 'html',
    likes: 0,
  })
  act(() => result.current.handleVote(true))
  await waitFor(() => expect(result.current.article!.likes).toBe(1))
  act(() => result.current.handleVote(false))
  await waitFor(() => expect(result.current.article!.dislikes).toBe(1))
})

it('maps full record; ignores errors and missing tenant', async () => {
  m.get.mockResolvedValue({
    data: {
      displayName: 'D',
      content: 'c',
      authorUsername: 'a',
      createdAt: '2024-01-02 03:04:05+00',
      rendererName: 'MD',
      viewCount: 3,
      likes: 2,
      dislikes: 1,
      tags: ['t'],
      revisionCount: 4,
    },
  })
  const a = renderHook(() => useArticle('n', 1))
  await waitFor(() => expect(a.result.current.article).not.toBeNull())
  expect(a.result.current.article).toMatchObject({
    title: 'D',
    renderer: 'md',
    views: 3,
    tags: ['t'],
  })
  m.post.mockRejectedValue(new Error('x'))
  act(() => a.result.current.handleVote(true))
  const b = renderHook(() => useArticle('n', null))
  act(() => b.result.current.handleVote(true))
  expect(m.post).toHaveBeenCalledTimes(1)
  m.get.mockRejectedValue(new Error('x'))
  const c = renderHook(() => useArticle('n', 1))
  await waitFor(() => expect(c.result.current.loading).toBe(false))
  act(() => c.result.current.handleVote(true))
})

it('formats dates', () => {
  expect(formatDay('')).toBe('')
  expect(formatDay('2024-01-02 03:04:05+00')).toMatch(/2024/)
  expect(formatDateTime('2024-01-02 03:04:05+00')).toMatch(/2024/)
})
