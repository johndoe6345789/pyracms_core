import { render, screen } from '@testing-library/react'
import ViewArticlePage, {
  generateMetadata,
} from '@/app/site/[slug]/(tenant)/articles/[name]/page'
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
