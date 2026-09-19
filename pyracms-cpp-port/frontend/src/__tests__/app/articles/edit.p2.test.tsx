import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { EditArticlePage } from '../../helpers/pages/EditArticlePage'
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

jest.mock(
  '@monaco-editor/react',
  () => jest.requireActual('../../helpers/scopeMocks').monacoMock,
)

const article = {
  displayName: 'Old',
  content: 'c',
  rendererName: 'HTML',
  tags: ['a', 'b'],
}

beforeEach(() => {
  jest.resetAllMocks()
  routeGet({ '/api/articles/n': article })
  m.put.mockResolvedValue({})
})

it('reports load and save failures', async () => {
  m.get.mockRejectedValue(new Error('x'))
  const { unmount } = render(<EditArticlePage />)
  await screen.findByText('Failed to load article')
  unmount()
  routeGet({ '/api/articles/n': {} })
  m.put.mockRejectedValueOnce(new Error('x'))
  render(<EditArticlePage />)
  await waitFor(() => expect(m.get).toHaveBeenCalled())
  fireEvent.click(screen.getByTestId('save-article-btn'))
  await screen.findByText('Failed to save article')
})
