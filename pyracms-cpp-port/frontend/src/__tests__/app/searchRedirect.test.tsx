import { render, screen } from '@testing-library/react'
import SearchPage from '@/app/search/page'

const replace = jest.fn()
let query = ''
jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
  useSearchParams: () => new URLSearchParams(query),
}))

beforeEach(() => replace.mockClear())

it('old /search?site= links move into the site', () => {
  query = 'site=rog&q=golf'
  render(<SearchPage />)
  expect(replace).toHaveBeenCalledWith('/site/rog/search?q=golf')
  expect(screen.queryByTestId('search-no-site')).toBeNull()
})

it('without a site there is nothing to search', () => {
  query = 'q=golf'
  render(<SearchPage />)
  expect(replace).not.toHaveBeenCalled()
  expect(screen.getByTestId('search-no-site')).toBeInTheDocument()
})
