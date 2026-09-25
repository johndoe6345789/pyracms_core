import { renderHook, act, waitFor } from '@testing-library/react'
import { useSnippetRevisions } from '@/hooks/useSnippetRevisions'
import { m } from '../helpers/scopeApi'

jest.mock('@/lib/api', () => jest.requireActual('../helpers/apiMock').apiMock)

const rows = [
  { id: 9, revisionNumber: 2, code: 'b', authorUsername: 'rog' },
  { id: 8, revisionNumber: 1, code: 'a', authorUsername: 'rog' },
]

beforeEach(() => {
  jest.resetAllMocks()
  m.get.mockResolvedValue({ data: rows })
})

it('loads newest first and exposes code as diff content', async () => {
  const { result } = renderHook(() => useSnippetRevisions('4', 1))
  await waitFor(() => expect(result.current.revisions).toHaveLength(2))
  expect(m.get).toHaveBeenCalledWith('/api/snippets/4/revisions?tenant_id=1')
  expect(result.current.latest).toBe(2)
  expect(result.current.byNumber(1)).toBe(rows[1])
  expect(result.current.diffs.map((d) => d.content)).toEqual(['a', 'b'])
})

it('does nothing without a tenant', () => {
  renderHook(() => useSnippetRevisions('4', null))
  expect(m.get).not.toHaveBeenCalled()
})

it('reverts then reloads, and reports failures', async () => {
  m.post.mockResolvedValueOnce({}).mockRejectedValueOnce(new Error('x'))
  const { result } = renderHook(() => useSnippetRevisions('4', 1))
  await waitFor(() => expect(result.current.loading).toBe(false))
  await act(() => result.current.revert(1))
  expect(m.post).toHaveBeenCalledWith('/api/snippets/4/revert/1', {})
  expect(m.get).toHaveBeenCalledTimes(2)
  await act(() => result.current.revert(1))
  expect(result.current.error).not.toBe('')
})
