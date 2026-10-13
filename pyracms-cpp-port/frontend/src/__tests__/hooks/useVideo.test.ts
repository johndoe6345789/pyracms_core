import { act, renderHook, waitFor } from '@testing-library/react'
import api from '@/lib/api'
import { useVideo } from '@/hooks/useVideo'
import { asMockApi } from '../helpers/mockApi'
import { makeVideo } from '../helpers/videoFixture'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}))
const m = asMockApi<'get' | 'post' | 'put' | 'delete'>(api)
beforeEach(() => Object.values(m).forEach((f) => f.mockReset()))
const VOTE = '/api/videos/7/vote?tenant_id=1'

const load = async (over = {}) => {
  m.get.mockResolvedValue({ data: makeVideo(over) })
  const h = renderHook(() => useVideo('7', 1))
  await waitFor(() => expect(h.result.current.video).not.toBeNull())
  return h.result
}

it('loads the video', async () => {
  const r = await load()
  expect(m.get).toHaveBeenCalledWith('/api/videos/7?tenant_id=1')
  expect(r.current.video?.title).toBe('Cat video')
})

it('votes, and clears the vote when the same thumb is clicked', async () => {
  const r = await load({ myVote: 'like' })
  m.delete.mockResolvedValue({ data: { likes: 2, dislikes: 1 } })
  await act(() => r.current.vote(true))
  expect(m.delete).toHaveBeenCalledWith(VOTE)
  expect(r.current.video?.myVote).toBe('')
  m.post.mockResolvedValue({
    data: { likes: 2, dislikes: 2, myVote: 'dislike' },
  })
  await act(() => r.current.vote(false))
  expect(m.post).toHaveBeenCalledWith(VOTE, { isLike: false })
  expect(r.current.video?.dislikes).toBe(2)
})

it('updates in place and deletes', async () => {
  const r = await load()
  m.put.mockResolvedValue({})
  const edit = { title: 'New', description: '', visibility: 'private' as const }
  await act(() => r.current.update(edit))
  expect(m.put).toHaveBeenCalledWith('/api/videos/7?tenant_id=1', edit)
  expect(r.current.video?.visibility).toBe('private')
  expect(m.get).toHaveBeenCalledTimes(1)
  m.delete.mockResolvedValue({})
  await act(() => r.current.remove())
  expect(m.delete).toHaveBeenCalledWith('/api/videos/7?tenant_id=1')
})

it('reports a missing video and waits for the tenant', async () => {
  m.get.mockRejectedValue({ response: { status: 404 } })
  const { result } = renderHook(() => useVideo('7', 1))
  await waitFor(() => expect(result.current.missing).toBe(true))
  m.get.mockClear()
  const idle = renderHook(() => useVideo('7', null)).result
  await act(() => idle.current.vote(true))
  expect(m.get).not.toHaveBeenCalled()
  expect(m.post).not.toHaveBeenCalled()
})
