import { renderHook, waitFor } from '@testing-library/react'
import api from '@/lib/api'
import { useTagContent } from '@/hooks/useTagContent'
import { asMockApi } from '../helpers/mockApi'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { get: jest.fn() },
}))
const m = asMockApi<'get'>(api)

it('loads the articles and snippets carrying a tag', async () => {
  m.get.mockImplementation((url: string) =>
    Promise.resolve(
      url.startsWith('/api/articles')
        ? { data: [{ name: 'a-1', displayName: 'Article One' }, { name: 'b' }] }
        : { data: { items: [{ id: 5, title: 'Snip' }] } },
    ),
  )
  const { result } = renderHook(() => useTagContent(3, 'a tag'))
  await waitFor(() => expect(result.current.loading).toBe(false))
  expect(m.get).toHaveBeenCalledWith(
    '/api/articles?tenant_id=3&tag=a%20tag&limit=100',
  )
  expect(result.current.articles).toEqual([
    { name: 'a-1', title: 'Article One' },
    { name: 'b', title: 'b' },
  ])
  expect(result.current.snippets[0]?.title).toBe('Snip')
})

it('shows nothing when both lookups fail, and waits for a tenant', async () => {
  m.get.mockReset().mockRejectedValue(new Error('x'))
  const { result } = renderHook(() => useTagContent(3, 't'))
  await waitFor(() => expect(result.current.loading).toBe(false))
  expect(result.current.articles).toEqual([])
  expect(result.current.snippets).toEqual([])
  m.get.mockClear()
  renderHook(() => useTagContent(null, 't'))
  expect(m.get).not.toHaveBeenCalled()
})
