import { renderHook, waitFor, act } from '@testing-library/react'
import api from '@/lib/api'
import { useThread } from '@/hooks/useThread'
import { asMockApi } from '../helpers/mockApi'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), put: jest.fn(),
    delete: jest.fn() },
}))
jest.mock('@/hooks/useForumUser', () => ({
  useForumUser: () => ({ userId: 1, isModerator: false }),
}))
const mock = asMockApi<'get' | 'post' | 'put' | 'delete'>(api)

async function setup() {
  mock.get.mockResolvedValue({ data: { posts: [] } })
  const hook = renderHook(() => useThread('10', 4))
  await waitFor(() => expect(hook.result.current.loading).toBe(false))
  return hook
}

beforeEach(() => {
  Object.values(mock).forEach((m) => m.mockReset())
  mock.post.mockResolvedValue({})
})

it('posts a reply and refreshes', async () => {
  const { result } = await setup()
  await act(async () => { await result.current.handleSubmitReply() })
  expect(mock.post).not.toHaveBeenCalled()
  act(() => result.current.setReplyContent(' hi '))
  await act(async () => { await result.current.handleSubmitReply() })
  expect(mock.post).toHaveBeenCalledWith('/api/forum/posts', {
    threadId: 10, content: 'hi',
  })
  expect(result.current.replyContent).toBe('')
})

it('surfaces reply errors', async () => {
  const { result } = await setup()
  mock.post.mockRejectedValueOnce({ response: { data: { error: 'no' } } })
  act(() => result.current.setReplyContent('x'))
  await act(async () => { await result.current.handleSubmitReply() })
  expect(result.current.replyError).toBe('no')
})

it('builds quotes', async () => {
  const { result } = await setup()
  act(() => result.current.handleQuote('bob', 'hey'))
  act(() => result.current.handleQuote('al', 'yo'))
  expect(result.current.replyContent)
    .toBe('[quote=bob]hey[/quote]\n\n\n\n[quote=al]yo[/quote]\n\n')
})
