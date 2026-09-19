import { renderHook, waitFor, act } from '@testing-library/react'
import api from '@/lib/api'
import { useThread } from '@/hooks/useThread'
import { asMockApi } from '../helpers/mockApi'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}))

jest.mock('@/hooks/useForumUser', () => ({
  useForumUser: () => ({ userId: 1, isModerator: true }),
}))

const mock = asMockApi<'get' | 'post' | 'put' | 'delete'>(api)

async function setup() {
  const hook = renderHook(() => useThread('10', 4))
  await waitFor(() => expect(hook.result.current.loading).toBe(false))
  return hook
}

beforeEach(() => {
  Object.values(mock).forEach((m) => m.mockReset())
  mock.get.mockResolvedValue({
    data: {
      pinned: true,
      locked: false,
      posts: [{ id: 1 }],
    },
  })
  mock.post.mockResolvedValue({})
  mock.put.mockResolvedValue({})
  mock.delete.mockResolvedValue({})
})

it('votes, edits and deletes posts', async () => {
  const { result } = await setup()
  await act(async () => {
    await result.current.handleVotePost('1', true)
  })
  expect(mock.post).toHaveBeenCalledWith('/api/forum/posts/1/vote', {
    isLike: true,
  })
  await act(async () => {
    await result.current.handleEditPost('1', 'n')
  })
  expect(mock.put).toHaveBeenCalledWith('/api/forum/posts/1', {
    content: 'n',
  })
  await act(async () => {
    await result.current.handleDeletePost('1')
  })
  expect(mock.delete).toHaveBeenCalledWith('/api/forum/posts/1')
})

it('reports a vote failure', async () => {
  const { result } = await setup()
  mock.post.mockRejectedValueOnce(new Error('x'))
  await act(async () => {
    await result.current.handleVotePost('1', false)
  })
  expect(result.current.replyError).toMatch(/vote/)
})
