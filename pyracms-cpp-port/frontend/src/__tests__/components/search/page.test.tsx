import { render, screen, fireEvent } from '@testing-library/react'
import SiteSearchPage from '@/app/site/[slug]/(tenant)/search/page'

const push = jest.fn()
const query = ''
jest.mock('next/navigation', () => ({
  useParams: () => ({ slug: 'rog' }),
  useRouter: () => ({ push }),
  useSearchParams: () => new URLSearchParams(query),
}))
let search = {
  q: '',
  type: 'all',
  page: 1,
  data: null as unknown,
  loading: false,
  failed: false,
  submit: jest.fn(),
  setType: jest.fn(),
  setPage: jest.fn(),
}
jest.mock('@/hooks/useSiteSearch', () => ({ useSiteSearch: () => search }))
jest.mock('@/hooks/useTagCloudPage', () => ({
  useTagCloudPage: () => ({
    items: [
      { name: 'golf', count: 5, href: '/site/rog/tags/golf' },
      { name: 'rare', count: 1, href: '/site/rog/tags/rare' },
    ],
  }),
}))

const hit = {
  type: 'article',
  id: 1,
  title: 'Videos',
  titleMarked: '',
  snippet: 's',
  url: '/site/rog/articles/videos',
  createdAt: '',
  author: '',
  tags: [],
}

beforeEach(() => {
  jest.clearAllMocks()
  search = { ...search, q: '', type: 'all', data: null, loading: false }
})

it('an empty search offers ways in, popular tags first', () => {
  render(<SiteSearchPage />)
  expect(screen.getByText('What are you looking for?')).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Articles' })).toHaveAttribute(
    'href',
    '/site/rog/articles',
  )
  const tags = screen
    .getAllByRole('link')
    .filter((l) => /tags\//.test(l.getAttribute('href') ?? ''))
  expect(tags.map((t) => t.textContent)).toEqual(['golf', 'rare'])
})

it('results show a count, kinds and cards', () => {
  search = {
    ...search,
    q: 'golf',
    data: { items: [hit], totalCount: 1, facets: { article: 1 } },
  }
  render(<SiteSearchPage />)
  expect(screen.getByRole('status')).toHaveTextContent('1 result for "golf"')
  expect(screen.getByTestId('search-result-0')).toBeInTheDocument()
  fireEvent.click(screen.getByTestId('kind-article'))
  expect(search.setType).toHaveBeenCalledWith('article')
  fireEvent.submit(screen.getByTestId('search-box'))
  expect(search.submit).toHaveBeenCalledWith('golf')
})
