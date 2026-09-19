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

it('never posts a made-up tenant when the site is unknown', () => {
  const { result } = renderHook(() => useCreateThread('2', 's', null))
  fill(result)
  act(() => result.current.handleSubmit())
  expect(mock.post).not.toHaveBeenCalled()
  expect(result.current.error).toMatch(/site/)
})

it('shows server errors', async () => {
  mock.post.mockRejectedValueOnce({ response: { data: { error: 'bad' } } })
  const { result } = renderHook(() => useCreateThread('2', 's', 1))
  fill(result)
  act(() => result.current.handleSubmit())
  await waitFor(() => expect(result.current.error).toBe('bad'))
  mock.post.mockRejectedValueOnce({ response: {} })
  act(() => result.current.handleSubmit())
  await waitFor(() =>
    expect(result.current.error).toBe('Failed to create thread'),
  )
  expect(result.current.loading).toBe(false)
})
