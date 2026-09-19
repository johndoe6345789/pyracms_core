import { render, screen } from '@testing-library/react'
import ViewArticlePage, {
  generateMetadata,
} from '@/app/site/[slug]/(tenant)/articles/[name]/page'
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
jest.mock('@/hooks/useSiteSession', () => ({
  useSiteSession: () => false,
}))
jest.mock('@/lib/metadata', () => ({
  generateArticleMetadata: jest.fn().mockResolvedValue({ title: 'T' }),
  fetchArticleJsonLd: jest.fn(),
}))
jest.mock(
  '@/components/common/JsonLd',
  () => jest.requireActual('../../helpers/stubs').LdStub,
)
jest.mock(
  '@/components/common/PageTransition',
  () => jest.requireActual('../../helpers/stubs').Passthrough,
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
