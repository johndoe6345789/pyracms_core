import { render, screen } from '@testing-library/react'
import Page from '@/app/site/[slug]/(admin)/admin/search/page'

let state = { loading: false, error: '' }
jest.mock('next/navigation', () => ({ useParams: () => ({ slug: 's' }) }))
jest.mock('@/hooks/useTenantId', () => ({
  useTenantId: () => ({ tenantId: 1, loading: false }),
}))
jest.mock('@/hooks/admin/useSearchIndexing', () => ({
  useSearchIndexing: () => state,
}))
jest.mock('@/components/admin/SearchIndexingPanel', () => ({
  SearchIndexingPanel: () => <div data-testid="panel" />,
}))

it('shows the panel once loaded', () => {
  state = { loading: false, error: '' }
  render(<Page />)
  expect(screen.getByText('Search Indexing')).toBeInTheDocument()
  expect(screen.getByTestId('panel')).toBeInTheDocument()
})

it('shows an error instead of hiding it', () => {
  state = { loading: false, error: 'Boom' }
  render(<Page />)
  expect(screen.getByTestId('search-indexing-error')).toHaveTextContent('Boom')
})
