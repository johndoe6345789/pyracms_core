import { render, screen, fireEvent } from '@testing-library/react'
import { GlobalSearch } from '@/components/common/search'
import SearchDialog from '@/components/common/search/SearchDialog'
import { MARK_CLOSE, MARK_OPEN } from '@/lib/search/marks'

const push = jest.fn()
jest.mock('next/navigation', () => ({ useRouter: () => ({ push }) }))
let hook = {
  open: true,
  setOpen: jest.fn(),
  q: 'golf ',
  setQ: jest.fn(),
  res: [] as unknown[],
  loading: false,
  slug: 'rog',
}
jest.mock('@/components/common/search/useGlobalSearch', () => ({
  useGlobalSearch: () => hook,
}))

const sug = (i: number) => ({
  type: 'article',
  title: `T${i}`,
  snippet: `see ${MARK_OPEN}golf${MARK_CLOSE}`,
  url: `/site/rog/articles/${i}`,
})
const input = () =>
  screen.getByTestId('search-dialog-input').querySelector('input')!

beforeEach(() => {
  jest.clearAllMocks()
  hook = { ...hook, q: 'golf ', res: [] }
})

it('Enter searches the whole site, not the portal', () => {
  render(<GlobalSearch />)
  fireEvent.click(screen.getByTestId('global-search-trigger'))
  expect(hook.setOpen).toHaveBeenCalledWith(true)
  fireEvent.keyDown(input(), { key: 'Enter' })
  expect(push).toHaveBeenCalledWith('/site/rog/search?q=golf')
})

it('nothing quick still offers the full search', () => {
  render(<GlobalSearch />)
  expect(screen.getByText(/No quick matches/)).toBeInTheDocument()
  fireEvent.click(screen.getByTestId('search-all'))
  expect(push).toHaveBeenCalledWith('/site/rog/search?q=golf')
})

it('arrow keys pick a suggestion and Enter opens it', () => {
  hook = { ...hook, res: [sug(1), sug(2)] }
  render(<GlobalSearch />)
  expect(screen.getAllByText('golf', { selector: 'mark' })).toHaveLength(2)
  fireEvent.keyDown(input(), { key: 'ArrowDown' })
  fireEvent.keyDown(input(), { key: 'ArrowDown' })
  fireEvent.keyDown(input(), { key: 'ArrowDown' }) // stops at the last
  fireEvent.keyDown(input(), { key: 'ArrowUp' })
  fireEvent.keyDown(input(), { key: 'Enter' })
  expect(push).toHaveBeenCalledWith('/site/rog/articles/1')
})

it('short input shows no list; clicking a row opens it', () => {
  const onSelect = jest.fn()
  const p = {
    open: true,
    query: 'g',
    results: [sug(3)],
    onClose: jest.fn(),
    onQueryChange: jest.fn(),
    onSelect,
    onSearchPage: jest.fn(),
  }
  const { rerender } = render(<SearchDialog {...p} />)
  expect(screen.queryByTestId('search-all')).toBeNull()
  rerender(<SearchDialog {...p} query="golf" />)
  fireEvent.click(screen.getByTestId('search-result-0'))
  expect(onSelect).toHaveBeenCalledWith(sug(3))
})
