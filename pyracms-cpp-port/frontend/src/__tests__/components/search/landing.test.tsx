import { render, screen } from '@testing-library/react'
import SearchLanding from '@/components/search/SearchLanding'

let items: unknown[] = []
jest.mock('@/hooks/useTagCloudPage', () => ({
  useTagCloudPage: () => ({ items }),
}))

it('without tags it just lists the sections', () => {
  render(<SearchLanding slug="rog" />)
  expect(screen.getByTestId('search-landing')).toBeInTheDocument()
  expect(screen.queryByText('Popular tags')).toBeNull()
})

it('after a miss it says what was searched for', () => {
  items = [{ name: 'golf', count: 2, href: '/site/rog/tags/golf' }]
  render(<SearchLanding slug="rog" missed="gof" />)
  expect(screen.getByText('Nothing found for "gof"')).toBeInTheDocument()
  expect(screen.getByText('Popular tags')).toBeInTheDocument()
})
