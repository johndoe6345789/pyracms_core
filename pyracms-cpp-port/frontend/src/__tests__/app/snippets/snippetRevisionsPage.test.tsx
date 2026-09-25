import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Page from '@/app/site/[slug]/(tenant)/snippets/[id]/revisions/page'
import { m } from '../../helpers/scopeApi'
import { routeGet } from '../../helpers/scopeMocks'

let user: { id: number } | null = { id: 7 }

jest.mock(
  '@/lib/api',
  () => jest.requireActual('../../helpers/apiMock').apiMock,
)
jest.mock('next/navigation', () => ({
  useParams: () => ({ slug: 's', id: '4' }),
}))
jest.mock('react-redux', () => ({
  useSelector: (fn: (x: unknown) => unknown) => fn({ auth: { user } }),
}))
jest.mock('@/hooks/useTenantId', () => ({
  useTenantId: () => ({ tenantId: 1, loading: false }),
}))
jest.mock('@/hooks/useSnippet', () => ({
  useSnippet: () => ({ snippet: { title: 'Sum', authorId: 7 } }),
}))
jest.mock('@monaco-editor/react', () => ({
  __esModule: true,
  default: (p: { value: string }) => <pre data-testid="monaco">{p.value}</pre>,
}))
jest.mock('react-diff-viewer-continued', () => ({
  __esModule: true,
  DiffMethod: { WORDS: 'w' },
  default: (p: { oldValue: string; newValue: string }) => (
    <div data-testid="diff">
      {p.oldValue}&gt;{p.newValue}
    </div>
  ),
}))

const revs = [
  { id: 9, revisionNumber: 2, title: 'Sum', code: 'b', language: 'python' },
  { id: 8, revisionNumber: 1, title: 'Sum', code: 'a', language: 'python' },
]

beforeEach(() => {
  jest.resetAllMocks()
  user = { id: 7 }
  routeGet({ '/revisions': revs })
})

it('lists, compares, views and reverts as the author', async () => {
  m.post.mockResolvedValue({})
  render(<Page />)
  await screen.findByTestId('revert-1')
  expect(screen.queryByTestId('revert-2')).toBeNull()
  expect(screen.getByTestId('diff')).toHaveTextContent('a>b')
  fireEvent.click(screen.getByTestId('view-rev-1'))
  expect(await screen.findByTestId('monaco')).toHaveTextContent('a')
  fireEvent.click(screen.getByTestId('close-revision-view'))
  fireEvent.click(screen.getByTestId('revert-1'))
  fireEvent.click(screen.getByTestId('confirm-revert'))
  await waitFor(() =>
    expect(m.post).toHaveBeenCalledWith('/api/snippets/4/revert/1', {}),
  )
})

it('hides revert from anyone but the author', async () => {
  user = { id: 99 }
  render(<Page />)
  await screen.findByTestId('view-rev-1')
  expect(screen.queryByTestId('revert-1')).toBeNull()
})

it('shows an error when the history fails to load', async () => {
  m.get.mockRejectedValue(new Error('nope'))
  render(<Page />)
  expect(await screen.findByTestId('revision-error')).toBeInTheDocument()
})
