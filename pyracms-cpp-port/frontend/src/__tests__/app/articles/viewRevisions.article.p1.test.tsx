import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ArticlePageClient } from '../../helpers/pages/ArticlePageClient'
import { m } from '../../helpers/scopeApi'
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

const signedIn = false

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

it('article page renders and votes', async () => {
  routeGet({
    '/api/articles/n': {
      id: 8,
      name: 'n',
      displayName: 'Title',
      content: '<p>hi</p>',
      tags: ['t'],
      likes: 1,
    },
  })
  m.post.mockResolvedValue({})
  render(<ArticlePageClient />)
  await screen.findByTestId('article-detail-page')
  expect(screen.getByTestId('comments-article-8')).toBeInTheDocument()
  fireEvent.click(screen.getByTestId('like-btn'))
  await waitFor(() =>
    expect(screen.getByTestId('like-count')).toHaveTextContent('2'),
  )
  expect(screen.getByTestId('tag-chip-t')).toHaveAttribute(
    'href',
    '/search?site=s&q=t',
  )
  expect(screen.queryByTestId('article-owner-actions')).toBeNull()
})
