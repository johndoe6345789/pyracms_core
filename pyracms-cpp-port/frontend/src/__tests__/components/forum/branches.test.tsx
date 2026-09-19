import {
  render,
  screen,
  fireEvent,
  renderHook,
  act,
  waitFor,
} from '@testing-library/react'
import { VoteButtons } from '@/components/forum/VoteButtons'
import { SearchResults } from '@/components/forum/SearchResults'
import { PostBody } from '@/components/forum/PostBody'
import { ForumSearchBar } from '@/components/forum/ForumSearchBar'
import { useForumSearch } from '@/components/forum/useForumSearch'
import api from '@/lib/api'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { get: jest.fn() },
}))
const get = api.get as jest.Mock
beforeEach(() => get.mockReset())

const res = {
  id: '1',
  threadId: '1',
  threadTitle: 'T',
  postContent: 'c',
  author: 'a',
  date: '',
  forumName: 'f',
}

describe('forum component defaults', () => {
  it('VoteButtons work without handlers', () => {
    render(<VoteButtons likes={1} dislikes={2} />)
    fireEvent.click(screen.getByTestId('vote-like-button'))
    fireEvent.click(screen.getByTestId('vote-dislike-button'))
    expect(screen.getByTestId('vote-buttons')).toBeInTheDocument()
  })

  it('VoteButtons forward votes when enabled', () => {
    const onVote = jest.fn()
    render(<VoteButtons likes={1} dislikes={2} onVote={onVote} />)
    fireEvent.click(screen.getByTestId('vote-dislike-button'))
    expect(onVote).toHaveBeenCalledWith(false)
  })

  it('SearchResults render without a click handler', () => {
    render(<SearchResults results={[res, { ...res, id: '2' }]} query="q" />)
    expect(screen.getByTestId('search-result-2')).toBeInTheDocument()
  })

  it('PostBody keeps text around quotes', () => {
    render(<PostBody content="[quote=a]x[/quote] tail" />)
    expect(screen.getByText('a wrote:')).toBeInTheDocument()
    expect(screen.getByText('tail')).toBeInTheDocument()
  })

  it('ForumSearchBar offers default forums in filters', () => {
    render(<ForumSearchBar />)
    fireEvent.click(screen.getByTestId('forum-search-filters-btn'))
    fireEvent.mouseDown(screen.getAllByRole('combobox')[0]!)
    expect(screen.getByText('Technology')).toBeInTheDocument()
  })
})

describe('useForumSearch fallbacks', () => {
  it('fills blanks for sparse rows', async () => {
    get.mockResolvedValue({
      data: {
        items: [
          { id: 1 },
          { id: 2, snippet: 's', createdAt: '2024-05-06T10:00:00Z' },
        ],
      },
    })
    const { result } = renderHook(() => useForumSearch())
    act(() => result.current.search('q', '', ''))
    await waitFor(() => expect(result.current.results).toHaveLength(2))
    expect(result.current.results[0]).toMatchObject({
      threadTitle: '',
      postContent: '',
      author: '',
      forumName: '',
    })
    expect(result.current.results[1]).toMatchObject({
      postContent: 's',
      date: '2024-05-06',
    })
  })

  it('accepts a null payload', async () => {
    get.mockResolvedValue({ data: { items: null } })
    const { result } = renderHook(() => useForumSearch(2))
    act(() => result.current.search('', '', ''))
    await waitFor(() => expect(result.current.hasSearched).toBe(true))
  })
})
