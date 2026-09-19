import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { RevisionsPage } from '../../helpers/pages/RevisionsPage'
import { m } from '../../helpers/scopeApi'
import { routeGet } from '../../helpers/scopeMocks'

jest.mock(
  'react-markdown',
  () => jest.requireActual('../../helpers/scopeMocks').markdownMock,
)
jest.mock(
  'remark-gfm',
  () => jest.requireActual('../../helpers/scopeMocks').gfmMock,
)
jest.mock(
  '@/lib/api',
  () => jest.requireActual('../../helpers/apiMock').apiMock,
)
jest.mock(
  'next/navigation',
  () => jest.requireActual('../../helpers/scopeMocks').navMock,
)
jest.mock(
  '@/hooks/useTenantId',
  () => jest.requireActual('../../helpers/scopeMocks').tenantMock,
)
jest.mock('react-diff-viewer-continued', () => ({
  __esModule: true,
  DiffMethod: { WORDS: 'w' },
  default: (p: { oldValue: string; newValue: string }) => (
    <div data-testid="diff">
      {p.oldValue}&gt;{p.newValue}
    </div>
  ),
}))

beforeEach(() => jest.resetAllMocks())

it('revisions page lists, compares and reverts', async () => {
  routeGet({
    '/revisions': [
      { id: 8, revisionNumber: 2, content: 'two' },
      { id: 7, revisionNumber: 1, content: 'one' },
    ],
  })
  m.post.mockResolvedValue({})
  render(<RevisionsPage />)
  await screen.findByTestId('revert-1')
  expect(screen.queryByTestId('revert-2')).toBeNull()
  expect(screen.getByTestId('diff')).toHaveTextContent('one>two')
  fireEvent.click(screen.getByTestId('revert-1'))
  fireEvent.click(screen.getByTestId('confirm-revert'))
  await waitFor(() =>
    expect(m.post).toHaveBeenCalledWith('/api/articles/n/revert/1', {
      tenant_id: 1,
    }),
  )
  expect(screen.getByTestId('back-to-article-btn')).toHaveAttribute(
    'href',
    '/site/s/articles/n',
  )
})
