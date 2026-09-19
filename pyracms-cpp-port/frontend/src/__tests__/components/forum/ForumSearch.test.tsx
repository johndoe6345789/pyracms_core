import {
  render,
  screen,
  fireEvent,
  waitFor,
  renderHook,
  act,
} from '@testing-library/react'
import api from '@/lib/api'
import { ForumSearchBar } from '@/components/forum/ForumSearchBar'
import { useForumSearch } from '@/components/forum/useForumSearch'
import { asMockApi } from '../../helpers/mockApi'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { get: jest.fn() },
}))
const mock = asMockApi<'get'>(api)

const items = [
  {
    id: 1,
    title: 'Hello',
    snippet: 'a <b>needle</b> here',
    author: 'Ann',
    forumName: 'Tech',
    createdAt: '2024-03-04T00:00:00Z',
  },
  { id: 2, title: 'Other', content: 'zzz', author: 'Bob' },
]

beforeEach(() => mock.get.mockReset())

describe('useForumSearch', () => {
  it('filters by author and forum', async () => {
    mock.get.mockResolvedValue({ data: { items } })
    const { result } = renderHook(() => useForumSearch(3))
    act(() => result.current.search('q', 'ann', 'Tech'))
    await waitFor(() => expect(result.current.hasSearched).toBe(true))
    expect(mock.get).toHaveBeenCalledWith(
      '/api/search?q=q&tenant_id=3&type=forum_post',
    )
    expect(result.current.results.map((x) => x.id)).toEqual(['1'])
    expect(result.current.results[0]!.threadId).toBe('')
  })
  it('accepts array data and tolerates errors', async () => {
    mock.get.mockResolvedValueOnce({ data: items })
    const { result } = renderHook(() => useForumSearch())
    act(() => result.current.search('', '', ''))
    await waitFor(() => expect(result.current.results).toHaveLength(2))
    expect(result.current.results[1]!.date).toBe('')
    mock.get.mockRejectedValueOnce(new Error('x'))
    act(() => result.current.search('q', '', ''))
    await waitFor(() => expect(result.current.results).toHaveLength(0))
  })
})

describe('ForumSearchBar', () => {
  it('searches on enter and reports clicks', async () => {
    mock.get.mockResolvedValue({ data: { items } })
    const onResultClick = jest.fn()
    render(<ForumSearchBar tenantId={1} onResultClick={onResultClick} />)
    const input = screen
      .getByTestId('forum-search-input')
      .querySelector('input')!
    fireEvent.change(input, { target: { value: 'needle' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    await screen.findByTestId('search-result-1')
    fireEvent.click(screen.getByTestId('search-result-1'))
    expect(onResultClick).toHaveBeenCalledWith(
      expect.objectContaining({ id: '1' }),
    )
  })
  it('shows an empty message and toggles filters', async () => {
    mock.get.mockResolvedValue({ data: { items: [] } })
    render(<ForumSearchBar forums={['X']} />)
    fireEvent.click(screen.getByTestId('forum-search-filters-btn'))
    fireEvent.change(
      screen.getByTestId('search-filter-author').querySelector('input')!,
      { target: { value: 'a' } },
    )
    fireEvent.change(
      screen.getByTestId('search-filter-date-from').querySelector('input')!,
      { target: { value: '2024-01-01' } },
    )
    fireEvent.change(
      screen.getByTestId('search-filter-date-to').querySelector('input')!,
      { target: { value: '2024-02-01' } },
    )
    fireEvent.mouseDown(screen.getAllByRole('combobox')[0]!)
    fireEvent.click(screen.getByText('X'))
    fireEvent.click(screen.getByTestId('forum-search-submit'))
    await screen.findByText('No results found.')
  })
})
