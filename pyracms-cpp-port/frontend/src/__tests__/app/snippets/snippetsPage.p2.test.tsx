import { render, screen, fireEvent } from '@testing-library/react'
import SnippetsPage from '@/app/site/[slug]/(tenant)/snippets/page'

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

it('toggles an active language filter off', () => {
  s.language = 'go'
  render(<SnippetsPage />)
  fireEvent.click(screen.getByText('go'))
  expect(setters.setLanguage).toHaveBeenCalledWith('')
})
