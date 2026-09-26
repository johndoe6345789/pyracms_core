import { fetchSearch, fetchSuggestions } from '@/lib/search/api'
import { m } from '../../helpers/scopeApi'

jest.mock(
  '@/lib/api',
  () => jest.requireActual('../../helpers/apiMock').apiMock,
)

beforeEach(() => jest.resetAllMocks())

it('asks for a page and puts every hit under the site', async () => {
  m.get.mockResolvedValue({
    data: {
      totalCount: 12,
      facets: { article: 12 },
      items: [
        { type: 'article', id: 3, title: 'T', url: '/articles/t', tags: ['a'] },
        { id: 'x' },
      ],
    },
  })
  const page = await fetchSearch('rog', 6, 'golf', 'all', 3)
  expect(m.get.mock.calls[0][1].params).toEqual({
    q: 'golf',
    tenant_id: 6,
    type: '',
    limit: 10,
    offset: 20,
  })
  expect(page.totalCount).toBe(12)
  expect(page.items[0]).toMatchObject({
    url: '/site/rog/articles/t',
    tags: ['a'],
    author: '',
  })
  expect(page.items[1]).toMatchObject({ type: '', id: 0, tags: [] })
})

it('filters by kind and copes with an empty reply', async () => {
  m.get.mockResolvedValue({ data: {} })
  const page = await fetchSearch('rog', 6, 'x', 'snippet', 1)
  expect(m.get.mock.calls[0][1].params.type).toBe('snippet')
  expect(page).toEqual({ items: [], totalCount: 0, facets: {} })
})

it('maps suggestions from either reply shape', async () => {
  m.get.mockResolvedValueOnce({
    data: [
      { text: 'Golf', type: 'article', url: '/articles/golf', snippet: 's' },
    ],
  })
  expect(await fetchSuggestions('rog', 6, 'gol')).toEqual([
    {
      type: 'article',
      title: 'Golf',
      snippet: 's',
      url: '/site/rog/articles/golf',
    },
  ])
  m.get.mockResolvedValueOnce({ data: { items: [{ title: 'T' }] } })
  expect((await fetchSuggestions('rog', 6, 'gol'))[0]).toMatchObject({
    type: 'article',
    url: '#',
  })
})
