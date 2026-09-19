import { renderHook, waitFor } from '@testing-library/react'
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

const data = {
  name: 'T', description: 'D', forumId: 3, forumName: 'F',
  pinned: false, locked: true, viewCount: 9,
  posts: [{ id: 1, userId: 1, content: 'a' }, { id: 2, userId: 2 }],
}

async function setup() {
  mock.get.mockResolvedValue({ data })
  const hook = renderHook(() => useThread('10', 4))
  await waitFor(() => expect(hook.result.current.loading).toBe(false))
  return hook
}

beforeEach(() => {
  Object.values(mock).forEach((m) => m.mockReset())
  mock.post.mockResolvedValue({})
  mock.put.mockResolvedValue({})
  mock.delete.mockResolvedValue({})
})

it('loads and maps the thread', async () => {
  const { result } = await setup()
  expect(mock.get).toHaveBeenCalledWith('/api/forum/threads/10?tenant_id=4')
  expect(result.current.thread).toMatchObject({
    title: 'T', forumId: '3', locked: true, views: 9,
  })
  expect(result.current.posts.map((p) => p.isOwner)).toEqual([true, false])
  expect(result.current.posts[1]!.author).toBe('Unknown')
})

it('reports missing and failing threads', async () => {
  mock.get.mockRejectedValueOnce({ response: { status: 404 } })
  const a = renderHook(() => useThread('10', 4))
  await waitFor(() => expect(a.result.current.error).toMatch(/not exist/))
  mock.get.mockRejectedValueOnce(new Error('x'))
  const b = renderHook(() => useThread('10', 4))
  await waitFor(() => expect(b.result.current.error).toMatch(/Could not/))
})

it('skips fetching without a tenant', () => {
  renderHook(() => useThread('10', null))
  expect(mock.get).not.toHaveBeenCalled()
})
