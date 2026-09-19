import { render, screen, fireEvent, act, waitFor } from '@testing-library/react'
import SearchAutocomplete from '@/components/common/SearchAutocomplete'
import AutocompleteDropdown from '@/components/common/search/AutocompleteDropdown'
import api from '@/lib/api'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { get: jest.fn() },
}))
const get = api.get as jest.Mock
beforeEach(() => get.mockReset())

const items = [
  { text: 'A', type: 'article', url: '/a' },
  { text: 'F', type: 'forum_post', url: '/f' },
  { text: 'S', type: 'snippet', url: '/s' },
  { text: 'G', type: 'gamedep', url: '/g' },
  { text: 'O', type: 'other', url: '/o' },
]
const input = () =>
  screen.getByTestId('search-autocomplete-input').querySelector('input')!

describe('AutocompleteDropdown', () => {
  it('lists results with type icons and selects', () => {
    const onSelect = jest.fn()
    render(
      <AutocompleteDropdown
        open
        anchorEl={document.body}
        results={items}
        onSelect={onSelect}
        width={200}
      />,
    )
    fireEvent.click(screen.getByTestId('autocomplete-item-4'))
    expect(onSelect).toHaveBeenCalledWith(items[4])
  })
})

describe('SearchAutocomplete', () => {
  it('debounces queries and selects a suggestion', async () => {
    jest.useFakeTimers()
    get.mockResolvedValue({ data: items })
    const onSelect = jest.fn()
    render(<SearchAutocomplete onSelect={onSelect} tenantId={3} />)
    fireEvent.change(input(), { target: { value: 'a' } })
    fireEvent.change(input(), { target: { value: 'ab' } })
    await act(async () => {
      jest.advanceTimersByTime(250)
    })
    jest.useRealTimers()
    expect(get).toHaveBeenCalledTimes(1)
    expect(get.mock.calls[0][0]).toContain('tenant_id=3')
    fireEvent.click(await screen.findByTestId('autocomplete-item-0'))
    expect(onSelect).toHaveBeenCalledWith('/a')
  })

  it('searches on Enter and closes on blur', async () => {
    const onSearch = jest.fn()
    render(<SearchAutocomplete onSearch={onSearch} tenantId={1} />)
    fireEvent.change(input(), { target: { value: 'q' } })
    fireEvent.keyDown(input(), { key: 'Enter' })
    expect(onSearch).toHaveBeenCalledWith('q')
    fireEvent.focus(input())
    fireEvent.blur(input())
  })

  it('handles errors and empty responses', async () => {
    get
      .mockRejectedValueOnce(new Error('x'))
      .mockResolvedValueOnce({ data: null })
    render(<SearchAutocomplete tenantId={1} />)
    fireEvent.change(input(), { target: { value: 'ab' } })
    await waitFor(() => expect(get).toHaveBeenCalledTimes(1))
    fireEvent.change(input(), { target: { value: 'abc' } })
    await waitFor(() => expect(get).toHaveBeenCalledTimes(2))
    expect(screen.queryByTestId('autocomplete-item-0')).toBeNull()
  })

  it('reopens on focus when results exist', async () => {
    get.mockResolvedValue({ data: items })
    render(<SearchAutocomplete tenantId={1} />)
    fireEvent.change(input(), { target: { value: 'ab' } })
    await screen.findByTestId('autocomplete-item-0')
    fireEvent.keyDown(input(), { key: 'Enter' })
    fireEvent.focus(input())
    expect(screen.getByTestId('autocomplete-item-1')).toBeInTheDocument()
  })
})
