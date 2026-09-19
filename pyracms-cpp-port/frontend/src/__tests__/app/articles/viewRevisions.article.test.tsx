import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ArticlePageClient from
  '@/app/site/[slug]/(tenant)/articles/[name]/ArticlePageClient'
import { m } from '../../helpers/scopeApi'
import { routeGet } from '../../helpers/scopeMocks'

jest.mock('react-markdown',
  () => require('../../helpers/scopeMocks').markdownMock)
jest.mock('remark-gfm', () => require('../../helpers/scopeMocks').gfmMock)
jest.mock('@/lib/api', () => require('../../helpers/apiMock').apiMock)
jest.mock('next/navigation', () => require('../../helpers/scopeMocks').navMock)
jest.mock('@/hooks/useTenantId',
  () => require('../../helpers/scopeMocks').tenantMock)
let signedIn = false
jest.mock('@/hooks/useSiteSession', () => ({
  useSiteSession: () => signedIn,
}))
jest.mock('@/components/common/PageTransition',
  () => ({ children }: { children: React.ReactNode }) => <>{children}</>)

beforeEach(() => {
  jest.resetAllMocks()
})

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
  expect(screen.queryByTestId('article-owner-actions')).toBeNull()
})

it('article page shows owner actions to signed-in users', async () => {
  signedIn = true
  routeGet({ '/api/articles/n': { name: 'n', displayName: 'Title',
    content: '', status: 'draft' } })
  render(<ArticlePageClient />)
  expect(await screen.findByTestId('article-owner-actions'))
    .toBeInTheDocument()
  expect(screen.getByTestId('article-status')).toHaveTextContent('draft')
  signedIn = false
})

it('article page renders nothing before load', () => {
  routeGet({})
  const { container } = render(<ArticlePageClient />)
  expect(container).toBeEmptyDOMElement()
})
