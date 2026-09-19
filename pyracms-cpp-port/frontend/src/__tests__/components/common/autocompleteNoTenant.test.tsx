import { render, screen, fireEvent, act } from '@testing-library/react'
import SearchAutocomplete from '@/components/common/SearchAutocomplete'
import api from '@/lib/api'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { get: jest.fn() },
}))
const get = api.get as jest.Mock

// Search is per site; the box must not fall back to a made-up tenant.
it('sends no request without a tenant', async () => {
  jest.useFakeTimers()
  render(<SearchAutocomplete />)
  const box = screen.getByTestId('search-autocomplete-input')
  fireEvent.change(box.querySelector('input')!, { target: { value: 'ab' } })
  await act(async () => {
    jest.advanceTimersByTime(250)
  })
  jest.useRealTimers()
  expect(get).not.toHaveBeenCalled()
})
