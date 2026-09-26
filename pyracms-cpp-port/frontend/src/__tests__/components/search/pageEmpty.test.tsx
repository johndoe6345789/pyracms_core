import { render, screen } from '@testing-library/react'
import SiteSearchPage from '@/app/site/[slug]/(tenant)/search/page'

jest.mock('next/navigation', () => ({ useParams: () => ({ slug: 'rog' }) }))
jest.mock('@/hooks/useSiteSearch', () => ({
  useSiteSearch: () => ({
    q: 'zzz',
    type: 'all',
    page: 1,
    data: { items: [], totalCount: 0, facets: {} },
    loading: false,
    failed: false,
    submit: jest.fn(),
    setType: jest.fn(),
    setPage: jest.fn(),
  }),
}))
jest.mock('@/hooks/useTagCloudPage', () => ({
  useTagCloudPage: () => ({ items: [] }),
}))

it('nothing found says so and still helps', () => {
  render(<SiteSearchPage />)
  expect(screen.getByText('Nothing found for "zzz"')).toBeInTheDocument()
  expect(screen.queryByTestId('search-result-0')).toBeNull()
})
