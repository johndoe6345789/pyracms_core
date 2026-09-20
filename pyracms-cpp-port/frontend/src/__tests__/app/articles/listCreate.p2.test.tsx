import { render, screen, fireEvent, within } from '@testing-library/react'
import CreateArticlePage from '@/app/site/[slug]/(tenant)/articles/create/page'
import { m } from '../../helpers/scopeApi'
import { push } from '../../helpers/scopeMocks'

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

jest.mock('@/hooks/usePermissions', () => ({
  usePermissions: () => ({ can: () => true, signedIn: true }),
}))

beforeEach(() => jest.resetAllMocks())

const fill = (title: string) => {
  fireEvent.change(
    within(screen.getByTestId('article-title-input')).getByRole('textbox'),
    { target: { value: title } },
  )
  fireEvent.change(screen.getByTestId('monaco'), { target: { value: 'body' } })
}

it('create page shows errors and skips empty content', async () => {
  m.post.mockRejectedValue(new Error('x'))
  render(<CreateArticlePage />)
  fill('T')
  fireEvent.change(screen.getByTestId('monaco'), { target: { value: ' ' } })
  fireEvent.click(screen.getByTestId('create-article-submit'))
  expect(m.post).not.toHaveBeenCalled()
  fireEvent.change(screen.getByTestId('monaco'), { target: { value: 'b' } })
  fireEvent.click(screen.getByTestId('create-article-submit'))
  await screen.findByTestId('create-article-error')
  expect(push).not.toHaveBeenCalled()
})
