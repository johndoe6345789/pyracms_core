import { render, screen, fireEvent, act } from '@testing-library/react'
import SearchAutocomplete from '@/components/common/SearchAutocomplete'
import { AutocompleteDropdown } from '../../helpers/imports/autocompleteDropdown'
import api from '@/lib/api'
import { items, input } from '../../helpers/autocompleteFixture'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { get: jest.fn() },
}))
const get = api.get as jest.Mock
beforeEach(() => get.mockReset())

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
})
