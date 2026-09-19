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
  __esModule: true,
  default: () => null,
}))

const setters = {
  setSearch: jest.fn(),
  setLanguage: jest.fn(),
  setSortBy: jest.fn(),
}

let s: Record<string, unknown> = {}

jest.mock('@/hooks/useSnippets', () => ({ useSnippets: () => s }))

beforeEach(() => {
  s = {
    snippets: [],
    total: 0,
    languages: ['python', 'go'],
    loading: false,
    error: false,
    search: '',
    language: '',
    sortBy: 'date',
    ...setters,
  }
})

it('lists snippets and wires filters', () => {
  s.snippets = [mapSnippet({ id: 1, title: 'Alpha', language: 'python' })]
  s.total = 1
  render(<SnippetsPage />)
  expect(screen.getByTestId('snippet-card-1')).toBeInTheDocument()
  fireEvent.change(
    screen.getByTestId('snippet-search').querySelector('input')!,
    { target: { value: 'q' } },
  )
  expect(setters.setSearch).toHaveBeenCalledWith('q')
  fireEvent.click(screen.getByText('go'))
  expect(setters.setLanguage).toHaveBeenCalledWith('go')
  fireEvent.click(screen.getByText('All'))
  expect(setters.setLanguage).toHaveBeenCalledWith('')
  fireEvent.mouseDown(screen.getByRole('combobox'))
  fireEvent.click(screen.getByText('Most Runs'))
  expect(setters.setSortBy).toHaveBeenCalledWith('popularity')
})
