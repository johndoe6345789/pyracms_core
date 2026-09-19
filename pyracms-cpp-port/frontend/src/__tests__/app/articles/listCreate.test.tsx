import {
  render, screen, fireEvent, waitFor, within,
} from '@testing-library/react'
import ArticleListPage from '@/app/site/[slug]/(tenant)/articles/page'
import CreateArticlePage from
  '@/app/site/[slug]/(tenant)/articles/create/page'
import {
  slugifyTitle,
} from '@/app/site/[slug]/(tenant)/articles/create/useCreateArticle'
import { m } from '../../helpers/scopeApi'
import { push, routeGet } from '../../helpers/scopeMocks'

jest.mock('@/lib/api', () => require('../../helpers/apiMock').apiMock)
jest.mock('next/navigation', () => require('../../helpers/scopeMocks').navMock)
jest.mock('@/hooks/useTenantId',
  () => require('../../helpers/scopeMocks').tenantMock)
jest.mock('@monaco-editor/react',
  () => require('../../helpers/scopeMocks').monacoMock)

beforeEach(() => jest.resetAllMocks())

it('slugifies titles', () => {
  expect(slugifyTitle(' Hello, World! ')).toBe('hello-world')
})

it('list page filters by search', async () => {
  routeGet({ '/api/articles': [{ name: 'a', displayName: 'Apple' },
    { name: 'b', displayName: 'Berry' }] })
  render(<ArticleListPage />)
  await screen.findByTestId('article-card-a')
  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'ber' } })
  expect(screen.queryByTestId('article-card-a')).toBeNull()
  expect(screen.getByTestId('create-article-btn')).toHaveAttribute(
    'href', '/site/s/articles/create')
})

const fill = (title: string) => {
  fireEvent.change(
    within(screen.getByTestId('article-title-input')).getByRole('textbox'),
    { target: { value: title } })
  fireEvent.change(screen.getByTestId('monaco'), { target: { value: 'body' } })
}

it('create page posts and navigates', async () => {
  m.post.mockResolvedValue({})
  render(<CreateArticlePage />)
  expect(screen.getByTestId('create-article-submit')).toBeDisabled()
  fill('My Post')
  fireEvent.click(screen.getByTestId('create-article-submit'))
  await waitFor(() => expect(push).toHaveBeenCalledWith(
    '/site/s/articles/my-post'))
  expect(m.post.mock.calls[0][1]).toMatchObject(
    { name: 'my-post', renderer: 'markdown', tenant_id: 1 })
})

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
