import { render, screen, fireEvent } from '@testing-library/react'
import ResultCard from '@/components/search/ResultCard'
import ResultList from '@/components/search/ResultList'
import { MARK_CLOSE, MARK_OPEN } from '@/lib/search/marks'
import type { SearchHit } from '@/lib/search/types'

const hit = (o: Partial<SearchHit> = {}): SearchHit => ({
  type: 'article',
  id: 1,
  title: 'Videos',
  titleMarked: '',
  snippet: `about ${MARK_OPEN}golf${MARK_CLOSE}`,
  url: '/site/rog/articles/videos',
  createdAt: '2014-01-21 18:27:14+00',
  author: 'rog',
  tags: ['golf', 'sport'],
  ...o,
})

it('a result links to the page, marks matches and lists tags', () => {
  render(<ResultCard hit={hit()} index={0} slug="rog" />)
  const link = screen.getByRole('link', { name: 'Videos' })
  expect(link).toHaveAttribute('href', '/site/rog/articles/videos')
  expect(screen.getByText('golf', { selector: 'mark' })).toBeInTheDocument()
  expect(screen.getByText('Article · by rog · 2014-01-21')).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'sport' })).toHaveAttribute(
    'href',
    '/site/rog/tags/sport',
  )
})

it('a result without excerpt, tags or safe link still renders', () => {
  render(
    <ResultCard
      hit={hit({ snippet: '', tags: [], url: 'javascript:alert(1)' })}
      index={2}
      slug="rog"
    />,
  )
  expect(screen.getByRole('link', { name: 'Videos' })).toHaveAttribute(
    'href',
    '#',
  )
})

const list = (o = {}) => ({
  slug: 'rog',
  hits: [hit(), hit({ id: 2 })],
  total: 25,
  page: 2,
  loading: false,
  failed: false,
  onPage: jest.fn(),
  ...o,
})

it('lists a page of results with paging', () => {
  const p = list()
  render(<ResultList {...p} />)
  expect(screen.getAllByRole('article')).toHaveLength(2)
  fireEvent.click(screen.getByRole('button', { name: 'Go to page 3' }))
  expect(p.onPage).toHaveBeenCalledWith(3)
})

it('shows loading, failure, and no pager for one page', () => {
  const { rerender } = render(
    <ResultList {...list({ hits: [], loading: true })} />,
  )
  expect(screen.getByTestId('search-loading')).toBeInTheDocument()
  rerender(<ResultList {...list({ failed: true })} />)
  expect(screen.getByRole('alert')).toHaveTextContent('unavailable')
  rerender(<ResultList {...list({ total: 2 })} />)
  expect(screen.queryByRole('navigation')).toBeNull()
})
