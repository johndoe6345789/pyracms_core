import { renderHook, act, waitFor } from '@testing-library/react'
import api from '@/lib/api'
import { useCreateThread } from '@/hooks/useCreateThread'
import { asMockApi } from '../helpers/mockApi'

const push = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}))

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { post: jest.fn() },
}))

const mock = asMockApi<'post'>(api)

beforeEach(() => {
  mock.post.mockReset()
  push.mockClear()
})

function fill(r: { current: ReturnType<typeof useCreateThread> }) {
  act(() => {
    r.current.setTitle(' T ')
    r.current.setDescription(' d ')
    r.current.setContent(' c ')
  })
}

it('requires a forum', () => {
  const { result } = renderHook(() => useCreateThread('', 's', 1))
  act(() => result.current.handleSubmit())
  expect(result.current.error).toMatch(/forum/)
})

it('requires title and content', () => {
  const { result } = renderHook(() => useCreateThread('2', 's', 1))
  act(() => result.current.handleSubmit())
  expect(result.current.error).toMatch(/required/)
})

it('creates a thread and navigates to it', async () => {
  mock.post.mockResolvedValue({ data: { id: 8 } })
  const { result } = renderHook(() => useCreateThread('2', 's', 1))
  fill(result)
  act(() => result.current.handleSubmit())
  await waitFor(() =>
    expect(push).toHaveBeenCalledWith('/site/s/forum/thread/8'),
  )
  expect(mock.post).toHaveBeenCalledWith('/api/forum/threads', {
    title: 'T',
    description: 'd',
    content: 'c',
    forumId: 2,
    tenantId: 1,
  })
})

it('falls back to the forum page without an id', async () => {
  mock.post.mockResolvedValue({ data: {} })
  const { result } = renderHook(() => useCreateThread('2', 's', 1))
  fill(result)
  act(() => result.current.handleSubmit())
  await waitFor(() => expect(push).toHaveBeenCalledWith('/site/s/forum/2'))
})
