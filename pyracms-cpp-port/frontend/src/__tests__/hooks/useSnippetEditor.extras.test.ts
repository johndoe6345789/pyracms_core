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

it('sends a summary only when updating, then clears it', async () => {
  mock.put.mockResolvedValue({})
  const initial = mapSnippet({ id: 5, title: 'A', code: 'c' })
  const { result } = renderHook(() => useSnippetEditor(2, initial))
  act(() => result.current.setSummary(' fix typo '))
  await act(async () => {
    await result.current.save()
  })
  expect(mock.put.mock.calls[0]?.[1]).toMatchObject({ summary: 'fix typo' })
  expect(result.current.summary).toBe('')
  await act(async () => {
    await result.current.save()
  })
  expect(mock.put.mock.calls[1]?.[1]).not.toHaveProperty('summary')
})

it('saves tags after creating and updating a snippet', async () => {
  mock.post.mockResolvedValue({ data: { id: 3 } })
  mock.put.mockResolvedValue({})
  const { result } = renderHook(() => useSnippetEditor(2))
  act(() => result.current.setTagsInput('a, b'))
  await act(async () => {
    await result.current.save()
  })
  expect(mock.put).toHaveBeenCalledWith('/api/snippets/3/tags', {
    tags: ['a', 'b'],
  })
  act(() => result.current.setTagsInput('a'))
  await act(async () => {
    await result.current.save()
  })
  expect(mock.put).toHaveBeenLastCalledWith('/api/snippets/3/tags', {
    tags: ['a'],
  })
})
