import { render, screen, fireEvent } from '@testing-library/react'
import api from '@/lib/api'
import { ForumSearchBar } from '@/components/forum/ForumSearchBar'
import { asMockApi } from '../../helpers/mockApi'
import { items } from '../../helpers/forumSearchItems'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { get: jest.fn() },
}))
const mock = asMockApi<'get'>(api)
beforeEach(() => mock.get.mockReset())

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
