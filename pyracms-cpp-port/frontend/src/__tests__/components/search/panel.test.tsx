import { render, screen, fireEvent } from '@testing-library/react'
import { SearchResultsPanel } from '@/components/search/SearchResultsPanel'

const r = (i: number) => ({
  type: 'article', id: i, title: `T${i}`, snippet: 's', url: '/x',
  rank: 1, createdAt: '',
})

const base = { loading: false, page: 1, query: 'q', setPage: jest.fn(),
  totalCount: 1, results: [r(1)] }

describe('SearchResultsPanel', () => {
  it('shows loading', () => {
    render(<SearchResultsPanel {...base} loading />)
    expect(screen.getByTestId('search-loading')).toBeInTheDocument()
  })

  it('shows empty states with and without a query', () => {
    const { rerender } = render(
      <SearchResultsPanel {...base} results={[]} />)
    expect(screen.getByTestId('search-empty'))
      .toHaveTextContent('No results for "q"')
    rerender(<SearchResultsPanel {...base} results={[]} query="" />)
    expect(screen.getByTestId('search-empty'))
      .toHaveTextContent('Enter a search query.')
  })

  it('hides pagination for one page', () => {
    render(<SearchResultsPanel {...base} />)
    expect(screen.getByTestId('search-results')).toBeInTheDocument()
    expect(screen.queryByTestId('search-pagination')).toBeNull()
  })

  it('paginates', () => {
    const setPage = jest.fn()
    render(<SearchResultsPanel {...base} totalCount={25}
      setPage={setPage} />)
    fireEvent.click(screen.getByLabelText('Go to page 2'))
    expect(setPage).toHaveBeenCalledWith(2)
  })
})
