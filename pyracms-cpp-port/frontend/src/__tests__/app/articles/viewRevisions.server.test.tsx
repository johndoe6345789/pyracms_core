import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ViewArticlePage, {
  generateMetadata,
} from '@/app/site/[slug]/(tenant)/articles/[name]/page'
import RevisionsPage from '@/app/site/[slug]/(tenant)/articles/[name]/revisions/page'
import { m } from '../../helpers/scopeApi'
import { routeGet } from '../../helpers/scopeMocks'

jest.mock(
  'react-markdown',
  () => require('../../helpers/scopeMocks').markdownMock,
)
jest.mock('remark-gfm', () => require('../../helpers/scopeMocks').gfmMock)
jest.mock('@/lib/api', () => require('../../helpers/apiMock').apiMock)
jest.mock('next/navigation', () => require('../../helpers/scopeMocks').navMock)
jest.mock(
  '@/hooks/useTenantId',
  () => require('../../helpers/scopeMocks').tenantMock,
)
jest.mock('@/hooks/useSiteSession', () => ({
  useSiteSession: () => false,
}))
jest.mock('@/lib/metadata', () => ({
  generateArticleMetadata: jest.fn().mockResolvedValue({ title: 'T' }),
  fetchArticleJsonLd: jest.fn(),
}))
jest.mock('@/components/common/JsonLd', () => () => <i data-testid="ld" />)
jest.mock(
  '@/components/common/PageTransition',
  () =>
    ({ children }: { children: React.ReactNode }) => <>{children}</>,
)

const { fetchArticleJsonLd, generateArticleMetadata } =
  jest.requireMock('@/lib/metadata')

beforeEach(() => {
  jest.resetAllMocks()
  generateArticleMetadata.mockResolvedValue({ title: 'T' })
})

it('server page renders json-ld only when present', async () => {
  routeGet({})
  const props = { params: Promise.resolve({ slug: 's', name: 'n' }) }
  expect(await generateMetadata(props)).toEqual({ title: 'T' })
  fetchArticleJsonLd.mockResolvedValueOnce({ a: 1 })
  render(await ViewArticlePage(props))
  expect(screen.getByTestId('ld')).toBeInTheDocument()
  fetchArticleJsonLd.mockResolvedValueOnce(null)
  const { container } = render(await ViewArticlePage(props))
  expect(container.querySelector('[data-testid="ld"]')).toBeNull()
})

jest.mock('react-diff-viewer-continued', () => ({
  __esModule: true,
  DiffMethod: { WORDS: 'w' },
  default: (p: { oldValue: string; newValue: string }) => (
    <div data-testid="diff">
      {p.oldValue}&gt;{p.newValue}
    </div>
  ),
}))

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
