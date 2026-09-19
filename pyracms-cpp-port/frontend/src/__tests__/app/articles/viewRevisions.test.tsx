import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ArticlePageClient from
  '@/app/site/[slug]/(tenant)/articles/[name]/ArticlePageClient'
import ViewArticlePage, { generateMetadata } from
  '@/app/site/[slug]/(tenant)/articles/[name]/page'
import RevisionsPage from
  '@/app/site/[slug]/(tenant)/articles/[name]/revisions/page'
import { m } from '../../helpers/scopeApi'
import { routeGet } from '../../helpers/scopeMocks'

jest.mock('@/lib/api', () => require('../../helpers/apiMock').apiMock)
jest.mock('next/navigation', () => require('../../helpers/scopeMocks').navMock)
jest.mock('@/hooks/useTenantId',
  () => require('../../helpers/scopeMocks').tenantMock)
jest.mock('@/lib/metadata', () => ({
  generateArticleMetadata: jest.fn().mockResolvedValue({ title: 'T' }),
  fetchArticleJsonLd: jest.fn(),
}))
jest.mock('@/components/common/JsonLd', () => () => <i data-testid="ld" />)
jest.mock('@/components/common/PageTransition',
  () => ({ children }: { children: React.ReactNode }) => <>{children}</>)

const { fetchArticleJsonLd } = jest.requireMock('@/lib/metadata')

beforeEach(() => jest.resetAllMocks())

it('article page renders and votes', async () => {
  routeGet({ '/api/articles/n': { name: 'n', displayName: 'Title',
    content: '<p>hi</p>', tags: ['t'], likes: 1 } })
  m.post.mockResolvedValue({})
  render(<ArticlePageClient />)
  await screen.findByTestId('article-detail-page')
  fireEvent.click(screen.getByTestId('like-btn'))
  await waitFor(() => expect(screen.getByTestId('like-count'))
    .toHaveTextContent('2'))
  expect(screen.getByTestId('tag-chip-t')).toHaveAttribute(
    'href', '/search?site=s&q=t')
})

it('article page renders nothing before load', () => {
  routeGet({})
  const { container } = render(<ArticlePageClient />)
  expect(container).toBeEmptyDOMElement()
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

it('revisions page lists and reverts', async () => {
  routeGet({ '/revisions': [{ revisionNumber: 2 }, { revisionNumber: 1 }] })
  m.post.mockResolvedValue({})
  render(<RevisionsPage />)
  await screen.findByTestId('revert-1')
  expect(screen.queryByTestId('revert-2')).toBeNull()
  fireEvent.click(screen.getByTestId('revert-1'))
  fireEvent.click(screen.getByTestId('confirm-revert'))
  await waitFor(() => expect(m.post).toHaveBeenCalledWith(
    '/api/articles/n/revert/1', { tenant_id: 1 }))
  expect(screen.getByTestId('back-to-article-btn')).toHaveAttribute(
    'href', '/site/s/articles/n')
})
