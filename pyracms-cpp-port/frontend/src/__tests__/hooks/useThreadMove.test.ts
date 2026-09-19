import { renderHook, waitFor, act } from '@testing-library/react'
import api from '@/lib/api'
import { useThread } from '@/hooks/useThread'
import { asMockApi } from '../helpers/mockApi'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { get: jest.fn(), put: jest.fn() },
}))
jest.mock('@/hooks/useForumUser', () => ({
  useForumUser: () => ({ userId: 1, isModerator: true }),
}))
const mock = asMockApi<'get' | 'put'>(api)

async function setup() {
  const hook = renderHook(() => useThread('10', 4))
  await waitFor(() => expect(hook.result.current.loading).toBe(false))
  return hook
}

beforeEach(() => {
  mock.get.mockReset().mockResolvedValue({ data: { posts: [] } })
  mock.put.mockReset().mockResolvedValue({})
})

it('moves the thread and refreshes', async () => {
  const { result } = await setup()
  await act(async () => { await result.current.handleMoveThread('7') })
  expect(mock.put).toHaveBeenCalledWith('/api/forum/threads/10/move', {
    forumId: 7,
  })
  expect(mock.get).toHaveBeenCalledTimes(2)
})

it('reports a failed move', async () => {
  const { result } = await setup()
  mock.put.mockRejectedValueOnce(new Error('x'))
  await act(async () => { await result.current.handleMoveThread('7') })
  expect(result.current.replyError).toMatch(/move/)
})
