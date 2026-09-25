import { render, screen, fireEvent } from '@testing-library/react'
import { SearchIndexingPanel } from '@/components/admin/SearchIndexingPanel'
import type { SearchStatus } from '@/hooks/admin/useSearchIndexing'

const base: SearchStatus = {
  engine: 'elasticsearch',
  configured: true,
  reachable: true,
  source: { article: 3, snippet: 5 },
  indexed: { article: 3 },
  pending: 2,
}
const hook = (over: Partial<SearchStatus> = {}, extra = {}) =>
  ({
    status: { ...base, ...over },
    busy: false,
    queued: null,
    reindex: jest.fn(),
    ...extra,
  }) as never

it('shows the engine, the queue and counts per type', () => {
  render(<SearchIndexingPanel s={hook()} />)
  expect(screen.getByTestId('search-engine')).toHaveTextContent('Elasticsearch')
  expect(screen.getByTestId('search-reachable')).toHaveTextContent('Reachable')
  expect(screen.getByTestId('search-pending')).toHaveTextContent('2 changes')
  expect(screen.getByTestId('index-row-snippet')).toHaveTextContent(
    'Code snippets50',
  )
})

it('reindexes on click and reports what was queued', () => {
  const s = hook({}, { queued: 8 })
  render(<SearchIndexingPanel s={s} />)
  fireEvent.click(screen.getByTestId('reindex-btn'))
  expect((s as unknown as { reindex: jest.Mock }).reindex).toHaveBeenCalled()
  expect(screen.getByTestId('reindex-started')).toHaveTextContent('8 items')
})

it('explains a site with no Elasticsearch and cannot reindex', () => {
  render(
    <SearchIndexingPanel
      s={hook({ configured: false, reachable: false, pending: 0 })}
    />,
  )
  expect(screen.getByTestId('search-engine')).toHaveTextContent('PostgreSQL')
  expect(screen.getByText(/not configured/)).toBeInTheDocument()
  expect(screen.getByTestId('reindex-btn')).toBeDisabled()
  expect(screen.getByTestId('index-row-article')).toHaveTextContent('-')
})

it('flags an unreachable cluster', () => {
  render(<SearchIndexingPanel s={hook({ reachable: false })} />)
  expect(screen.getByTestId('search-reachable')).toHaveTextContent(
    'Unreachable',
  )
  expect(screen.getByTestId('reindex-btn')).toBeDisabled()
})
