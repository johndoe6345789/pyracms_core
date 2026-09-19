import { render, screen } from '@testing-library/react'
import { ArticlePageClient } from '../../helpers/pages/ArticlePageClient'
import { routeGet } from '../../helpers/scopeMocks'

jest.mock('@/components/common/CommentSection', () =>
  jest.requireActual('../../helpers/commentMock').commentSectionMock(),
)

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

let signedIn = false

jest.mock('@/hooks/useSiteSession', () => ({
  useSiteSession: () => signedIn,
}))

jest.mock(
  '@/components/common/PageTransition',
  () => jest.requireActual('../../helpers/stubs').Passthrough,
)

beforeEach(() => {
  jest.resetAllMocks()
})

it('article page shows owner actions to signed-in users', async () => {
  signedIn = true
  routeGet({
    '/api/articles/n': {
      name: 'n',
      displayName: 'Title',
      content: '',
      status: 'draft',
    },
  })
  render(<ArticlePageClient />)
  expect(await screen.findByTestId('article-owner-actions')).toBeInTheDocument()
  expect(screen.getByTestId('article-status')).toHaveTextContent('draft')
  signedIn = false
})

it('article page renders nothing before load', () => {
  routeGet({})
  const { container } = render(<ArticlePageClient />)
  expect(container).toBeEmptyDOMElement()
})
