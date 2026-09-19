import { renderHook, act, waitFor } from '@testing-library/react'
import { useArticles, mapSummary } from '@/hooks/useArticles'
import { m } from '../../helpers/scopeApi'

jest.mock('@/lib/api', () => require('../../helpers/apiMock').apiMock)

beforeEach(() => jest.resetAllMocks())

it('maps summaries', () => {
  expect(mapSummary({ name: 'n' })).toMatchObject({
    title: 'n',
    excerpt: '',
    tags: [],
    date: '',
  })
  expect(
    mapSummary({
      name: 'n',
      displayName: 'D',
      content: '<b>hi</b>',
      createdAt: '2024-01-01T00:00',
      tags: ['x'],
    }),
  ).toMatchObject({ title: 'D', excerpt: 'hi...', date: '2024-01-01' })
})

it('loads and filters', async () => {
  m.get.mockResolvedValue({
    data: [
      { name: 'a', tags: ['red'] },
      { name: 'b', tags: [] },
    ],
  })
  const { result } = renderHook(() => useArticles(1))
  await waitFor(() => expect(result.current.loading).toBe(false))
  expect(result.current.articles).toHaveLength(2)
  act(() => result.current.setSearchQuery('RE'))
  expect(result.current.articles).toHaveLength(1)
})

it('tolerates errors, null data, no tenant', async () => {
  m.get.mockResolvedValue({ data: null })
  const a = renderHook(() => useArticles(1))
  await waitFor(() => expect(a.result.current.loading).toBe(false))
  m.get.mockRejectedValue(new Error('x'))
  const b = renderHook(() => useArticles(1))
  await waitFor(() => expect(b.result.current.loading).toBe(false))
  renderHook(() => useArticles(null))
})
