import { render, screen, fireEvent, within } from '@testing-library/react'
import CreateArticlePage from '@/app/site/[slug]/(tenant)/articles/create/page'
import { m } from '../../helpers/scopeApi'
import { push } from '../../helpers/scopeMocks'

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

jest.mock(
  '@monaco-editor/react',
  () => require('../../helpers/scopeMocks').monacoMock,
)

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
