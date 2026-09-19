import { render, screen, fireEvent } from '@testing-library/react'
import SearchPage from '@/app/search/page'

const push = jest.fn()
const search = {
  activeType: 'all', facets: {}, handleSearch: jest.fn(),
  handleTypeChange: jest.fn(), loading: false, page: 1, query: 'q',
  results: [] as unknown[], router: { push }, setPage: jest.fn(),
  totalCount: 0, tenantId: '4',
}
jest.mock('@/hooks/useSearchPage', () => ({
  SEARCH_ITEMS_PER_PAGE: 10, useSearchPage: () => search,
}))
jest.mock('@/components/common/SearchAutocomplete', () => ({
  __esModule: true,
  default: (p: { onSearch: (q: string) => void;
    onSelect: (u: string) => void }) => (<>
    <button onClick={() => p.onSearch('x')}>go</button>
    <button onClick={() => p.onSelect('/u')}>pick</button></>),
}))

describe('SearchPage', () => {
  it('wires search and selection', () => {
    render(<SearchPage />)
    fireEvent.click(screen.getByText('go'))
    fireEvent.click(screen.getByText('pick'))
    expect(search.handleSearch).toHaveBeenCalledWith('x')
    expect(push).toHaveBeenCalledWith('/u')
    expect(screen.getByTestId('search-empty')).toBeInTheDocument()
    expect(screen.queryByTestId('search-no-site')).toBeNull()
  })

  it('explains that search needs a site instead of guessing one', () => {
    search.tenantId = ''
    render(<SearchPage />)
    expect(screen.getByTestId('search-no-site')).toHaveTextContent(
      /site/)
    search.tenantId = '4'
  })
})
