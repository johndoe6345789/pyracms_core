import { render, screen, fireEvent, act } from '@testing-library/react'
import SearchDialog from '@/components/common/search/SearchDialog'
import SearchResultsList
  from '@/components/common/search/SearchResultsList'

const push = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}))
let hook = { open: true, setOpen: jest.fn(), q: 'hello',
  setQ: jest.fn(), res: [] as unknown[] }
jest.mock('@/components/common/search/useGlobalSearch', () => ({
  useGlobalSearch: () => hook,
}))

beforeEach(() => jest.clearAllMocks())

const r = (id: string, type: string, snippet = 's') =>
  ({ id, type, title: `T${id}`, snippet, url: `/u/${id}` }) as never

describe('SearchResultsList', () => {
  it('shows nothing for short queries and a message for misses', () => {
    const { container, rerender } = render(
      <SearchResultsList results={[]} query="a" onSelect={jest.fn()} />)
    expect(container).toBeEmptyDOMElement()
    rerender(<SearchResultsList results={[]} query="abc"
      onSelect={jest.fn()} />)
    expect(screen.getByText(/No results for/)).toBeInTheDocument()
  })

  it('groups results by type and truncates snippets', () => {
    const onSelect = jest.fn()
    render(<SearchResultsList query="x" onSelect={onSelect} results={[
      r('1', 'article', 'x'.repeat(100)), r('2', 'user')]} />)
    expect(screen.getByText('articles')).toBeInTheDocument()
    expect(screen.getByText(/x{80}\.\.\./)).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('search-result-2'))
    expect(onSelect).toHaveBeenCalled()
  })
})

describe('SearchDialog', () => {
  const p = { open: true, query: 'q', results: [], onClose: jest.fn(),
    onQueryChange: jest.fn(), onSelect: jest.fn(), onSearchPage: jest.fn() }

  it('reports typing and Enter, focusing on open', () => {
    jest.useFakeTimers()
    render(<SearchDialog {...p} />)
    act(() => { jest.advanceTimersByTime(150) })
    const input = screen.getByTestId('search-dialog-input')
      .querySelector('input')!
    expect(input).toHaveFocus()
    fireEvent.change(input, { target: { value: 'z' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    fireEvent.keyDown(input, { key: 'a' })
    expect(p.onQueryChange).toHaveBeenCalledWith('z')
    expect(p.onSearchPage).toHaveBeenCalledTimes(1)
    jest.useRealTimers()
  })

  it('ignores Enter without a query', () => {
    render(<SearchDialog {...p} query="" />)
    fireEvent.keyDown(screen.getByTestId('search-dialog-input')
      .querySelector('input')!, { key: 'Enter' })
    expect(p.onSearchPage).not.toHaveBeenCalled()
  })
})
