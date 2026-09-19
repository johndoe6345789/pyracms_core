import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import SearchAutocomplete from '@/components/common/SearchAutocomplete'
import api from '@/lib/api'
import { items, input } from '../../helpers/autocompleteFixture'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { get: jest.fn() },
}))
const get = api.get as jest.Mock
beforeEach(() => get.mockReset())

describe('SearchAutocomplete', () => {
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
