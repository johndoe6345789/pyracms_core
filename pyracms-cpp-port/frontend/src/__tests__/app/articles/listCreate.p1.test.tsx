import '../../helpers/scopeEditorMocks'
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from '@testing-library/react'
import ArticleListPage from '@/app/site/[slug]/(tenant)/articles/page'
import CreateArticlePage from '@/app/site/[slug]/(tenant)/articles/create/page'
import { slugifyTitle } from '../../helpers/pages/slugifyTitle'
import { m } from '../../helpers/scopeApi'
import { push, routeGet } from '../../helpers/scopeMocks'

jest.mock('@/hooks/usePermissions', () => ({
  usePermissions: () => ({ can: () => true, signedIn: true }),
}))

beforeEach(() => jest.resetAllMocks())

const fill = (title: string) => {
  fireEvent.change(
    within(screen.getByTestId('article-title-input')).getByRole('textbox'),
    { target: { value: title } },
  )
  // Markdown starts in its own editor; these tests drive the code editor
  fireEvent.click(screen.getByRole('button', { name: /Monaco/ }))
  fireEvent.change(screen.getByTestId('monaco'), { target: { value: 'body' } })
}

it('slugifies titles', () => {
  expect(slugifyTitle(' Hello, World! ')).toBe('hello-world')
})

it('list page filters by search', async () => {
  routeGet({
    '/api/articles': [
      { name: 'a', displayName: 'Apple' },
      { name: 'b', displayName: 'Berry' },
    ],
  })
  render(<ArticleListPage />)
  await screen.findByTestId('article-card-a')
  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'ber' } })
  expect(screen.queryByTestId('article-card-a')).toBeNull()
  expect(screen.getByTestId('create-article-btn')).toHaveAttribute(
    'href',
    '/site/s/articles/create',
  )
})

it('create page posts and navigates', async () => {
  m.post.mockResolvedValue({})
  render(<CreateArticlePage />)
  expect(screen.getByTestId('create-article-submit')).toBeDisabled()
  fill('My Post')
  fireEvent.click(screen.getByTestId('create-article-submit'))
  await waitFor(() =>
    expect(push).toHaveBeenCalledWith('/site/s/articles/my-post'),
  )
  expect(m.post.mock.calls[0][1]).toMatchObject({
    name: 'my-post',
    renderer: 'markdown',
    tenant_id: 1,
  })
})
