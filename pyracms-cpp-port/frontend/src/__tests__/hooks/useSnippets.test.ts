import { renderHook, waitFor, act } from '@testing-library/react'
import api from '@/lib/api'
import { useSnippets } from '@/hooks/useSnippets'
import { asMockApi } from '../helpers/mockApi'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { get: jest.fn() },
}))
const mock = asMockApi<'get'>(api)

const items = [
  { id: 1, title: 'Alpha', language: 'python', code: 'x', runCount: 1,
    authorUsername: 'ann', createdAt: '2024-01-01T00:00:00Z' },
  { id: 2, title: 'Beta', language: 'go', code: 'y', runCount: 9,
    authorUsername: 'bob', createdAt: '2024-02-01T00:00:00Z' },
]

beforeEach(() => mock.get.mockReset())

it('does not load without a tenant', () => {
  renderHook(() => useSnippets(null))
  expect(mock.get).not.toHaveBeenCalled()
})

it('loads, filters and sorts', async () => {
  mock.get.mockResolvedValue({ data: { items } })
  const { result } = renderHook(() => useSnippets(1))
  await waitFor(() => expect(result.current.loading).toBe(false))
  expect(result.current.total).toBe(2)
  expect(result.current.languages).toEqual(['python', 'go'])
  expect(result.current.snippets.map((s) => s.id)).toEqual(['2', '1'])
  act(() => result.current.setSortBy('popularity'))
  expect(result.current.snippets[0]!.id).toBe('2')
  act(() => result.current.setSearch('ann'))
  expect(result.current.snippets.map((s) => s.id)).toEqual(['1'])
  act(() => result.current.setSearch(''))
  act(() => result.current.setLanguage('go'))
  expect(result.current.snippets.map((s) => s.id)).toEqual(['2'])
})

it('handles a missing items list and errors', async () => {
  mock.get.mockResolvedValueOnce({ data: {} })
  const a = renderHook(() => useSnippets(1))
  await waitFor(() => expect(a.result.current.loading).toBe(false))
  expect(a.result.current.snippets).toEqual([])
  mock.get.mockRejectedValueOnce(new Error('x'))
  const b = renderHook(() => useSnippets(1))
  await waitFor(() => expect(b.result.current.error).toBe(true))
})
