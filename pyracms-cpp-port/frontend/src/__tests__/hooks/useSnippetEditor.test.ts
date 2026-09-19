import { renderHook, act } from '@testing-library/react'
import api from '@/lib/api'
import { useSnippetEditor } from '@/hooks/useSnippetEditor'
import { mapSnippet } from '@/lib/snippets'
import { asMockApi } from '../helpers/mockApi'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { post: jest.fn(), put: jest.fn() },
}))
const mock = asMockApi<'post' | 'put'>(api)

beforeEach(() => {
  mock.post.mockReset()
  mock.put.mockReset()
})

it('does not save without a tenant', async () => {
  const { result } = renderHook(() => useSnippetEditor(null))
  let id: string | null = 'x'
  await act(async () => {
    id = await result.current.save()
  })
  expect(id).toBeNull()
})

it('creates a snippet with defaults', async () => {
  mock.post.mockResolvedValue({ data: { id: 12 } })
  const { result } = renderHook(() => useSnippetEditor(2))
  let id: string | null = null
  await act(async () => {
    id = await result.current.save()
  })
  expect(id).toBe('12')
  expect(mock.post).toHaveBeenCalledWith('/api/snippets', {
    title: 'Untitled',
    code: 'print("Hello, world!")\n',
    language: 'python',
    visibility: 'public',
    tenant_id: 2,
  })
  expect(result.current.savedId).toBe('12')
})

it('updates an existing snippet', async () => {
  mock.put.mockResolvedValue({})
  const initial = mapSnippet({ id: 5, title: 'A', code: 'c' })
  const { result } = renderHook(() => useSnippetEditor(2, initial))
  act(() => result.current.setTitle(' New '))
  await act(async () => {
    await result.current.save()
  })
  expect(mock.put).toHaveBeenCalledWith(
    '/api/snippets/5',
    expect.objectContaining({ title: 'New' }),
  )
})

it('explains save failures', async () => {
  const { result } = renderHook(() => useSnippetEditor(2))
  mock.post.mockRejectedValueOnce({ response: { status: 401 } })
  await act(async () => {
    await result.current.save()
  })
  expect(result.current.error).toMatch(/log in/)
  mock.post.mockRejectedValueOnce(new Error('x'))
  await act(async () => {
    await result.current.save()
  })
  expect(result.current.error).toBe('Failed to save snippet.')
})
