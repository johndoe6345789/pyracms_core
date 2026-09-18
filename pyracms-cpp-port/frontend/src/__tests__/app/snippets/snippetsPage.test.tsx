import { render, screen, fireEvent } from '@testing-library/react'
import SnippetsPage from '@/app/site/[slug]/(tenant)/snippets/page'
import { mapSnippet } from '@/lib/snippets'

const push = jest.fn()
jest.mock('next/navigation', () => ({
  useParams: () => ({ slug: 's' }),
  useRouter: () => ({ push }),
}))
jest.mock('@/hooks/useTenantId', () => ({
  useTenantId: () => ({ tenantId: 1, loading: false }),
}))
jest.mock('@monaco-editor/react', () => ({
  __esModule: true, default: () => null,
}))
const setters = {
  setSearch: jest.fn(), setLanguage: jest.fn(), setSortBy: jest.fn(),
}
let s: Record<string, unknown> = {}
jest.mock('@/hooks/useSnippets', () => ({ useSnippets: () => s }))

beforeEach(() => {
  s = {
    snippets: [], total: 0, languages: ['python', 'go'], loading: false,
    error: false, search: '', language: '', sortBy: 'date', ...setters,
  }
})

it('shows the empty state with a create link', () => {
  render(<SnippetsPage />)
  expect(screen.getByTestId('no-snippets-msg')).toHaveTextContent(/first one/)
  expect(screen.getByText('Create a snippet').closest('a'))
    .toHaveAttribute('href', '/site/s/snippets/new')
})

it('shows a no-match message when filtering', () => {
  s.total = 3
  render(<SnippetsPage />)
  expect(screen.getByText('No snippets match your search.'))
    .toBeInTheDocument()
})

it('shows skeletons while loading and an error', () => {
  s.loading = true
  const { rerender } = render(<SnippetsPage />)
  expect(screen.queryByTestId('no-snippets-msg')).toBeNull()
  s = { ...s, loading: false, error: true }
  rerender(<SnippetsPage />)
  expect(screen.getByText(/Could not load snippets/)).toBeInTheDocument()
})

it('lists snippets and wires filters', () => {
  s.snippets = [mapSnippet({ id: 1, title: 'Alpha', language: 'python' })]
  s.total = 1
  render(<SnippetsPage />)
  expect(screen.getByTestId('snippet-card-1')).toBeInTheDocument()
  fireEvent.change(screen.getByTestId('snippet-search')
    .querySelector('input')!, { target: { value: 'q' } })
  expect(setters.setSearch).toHaveBeenCalledWith('q')
  fireEvent.click(screen.getByText('go'))
  expect(setters.setLanguage).toHaveBeenCalledWith('go')
  fireEvent.click(screen.getByText('All'))
  expect(setters.setLanguage).toHaveBeenCalledWith('')
  fireEvent.mouseDown(screen.getByRole('combobox'))
  fireEvent.click(screen.getByText('Most Runs'))
  expect(setters.setSortBy).toHaveBeenCalledWith('popularity')
})

it('toggles an active language filter off', () => {
  s.language = 'go'
  render(<SnippetsPage />)
  fireEvent.click(screen.getByText('go'))
  expect(setters.setLanguage).toHaveBeenCalledWith('')
})
