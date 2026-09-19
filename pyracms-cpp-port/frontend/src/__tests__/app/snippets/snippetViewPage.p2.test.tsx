import { render, screen, fireEvent } from '@testing-library/react'
import ViewSnippetPage from '@/app/site/[slug]/(tenant)/snippets/[id]/page'
import { mapSnippet } from '@/lib/snippets'

let user: { id: number } | null = { id: 7 }

let sn: Record<string, unknown> = {}

const [run, reload] = [jest.fn(), jest.fn()]

const act = {
  error: '',
  setError: jest.fn(),
  fork: jest.fn(),
  remove: jest.fn(),
}

jest.mock('next/navigation', () => ({
  useParams: () => ({ slug: 's', id: '4' }),
}))

jest.mock('react-redux', () => ({
  useSelector: (fn: (x: unknown) => unknown) => fn({ auth: { user } }),
}))

jest.mock('@monaco-editor/react', () => ({
  __esModule: true,
  default: () => null,
}))

jest.mock('@/hooks/useTenantId', () => ({
  useTenantId: () => ({ tenantId: 1, loading: false }),
}))

jest.mock('@/hooks/useSnippet', () => ({ useSnippet: () => sn }))

jest.mock('@/hooks/useSnippetRun', () => ({
  useSnippetRun: () => ({ running: false, result: null, run }),
}))

jest.mock('@/hooks/useSnippetActions', () => ({
  useSnippetActions: () => act,
}))

jest.mock('@/components/common/CommentSection', () =>
  require('../../helpers/commentMock').commentSectionMock(),
)

beforeEach(() => {
  user = { id: 7 }
  act.error = ''
  sn = {
    snippet: mapSnippet({ id: 4, authorId: 7, code: 'x', language: 'go' }),
    loading: false,
    notFound: false,
    reload,
  }
})

it('confirms deletion', () => {
  render(<ViewSnippetPage />)
  fireEvent.click(screen.getByTestId('delete-snippet-btn'))
  fireEvent.click(screen.getByTestId('confirm-delete-btn'))
  expect(act.remove).toHaveBeenCalled()
})

it('edits and cancels back to the read view', () => {
  render(<ViewSnippetPage />)
  fireEvent.click(screen.getByTestId('edit-snippet-btn'))
  fireEvent.click(screen.getByTestId('cancel-btn'))
  expect(screen.getByTestId('snippet-code-block')).toBeInTheDocument()
})
