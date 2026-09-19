import {
  render, screen, fireEvent, waitFor, within,
} from '@testing-library/react'
import EditArticlePage from
  '@/app/site/[slug]/(tenant)/articles/[name]/edit/page'
import { m } from '../../helpers/scopeApi'
import { push, routeGet } from '../../helpers/scopeMocks'

jest.mock('react-markdown',
  () => require('../../helpers/scopeMocks').markdownMock)
jest.mock('remark-gfm', () => require('../../helpers/scopeMocks').gfmMock)
jest.mock('@/lib/api', () => require('../../helpers/apiMock').apiMock)
jest.mock('next/navigation', () => require('../../helpers/scopeMocks').navMock)
jest.mock('@/hooks/useTenantId',
  () => require('../../helpers/scopeMocks').tenantMock)
jest.mock('@monaco-editor/react',
  () => require('../../helpers/scopeMocks').monacoMock)

const article = { displayName: 'Old', content: 'c', rendererName: 'HTML',
  tags: ['a', 'b'] }

beforeEach(() => {
  jest.resetAllMocks()
  routeGet({ '/api/articles/n': article })
  m.put.mockResolvedValue({})
})

const summary = () =>
  within(screen.getByTestId('summary-input')).getByRole('textbox')

it('loads the article, auto-summarises and saves', async () => {
  render(<EditArticlePage />)
  await waitFor(() => expect(screen.getByTestId('monaco'))
    .toHaveValue('c'))
  fireEvent.change(screen.getByTestId('monaco'), { target: { value: 'd' } })
  await waitFor(() => expect(summary()).toHaveValue('Updated content'))
  fireEvent.mouseDown(within(screen.getByTestId('renderer-select'))
    .getByRole('combobox'))
  fireEvent.click(screen.getByRole('option', { name: 'BBCode' }))
  fireEvent.click(screen.getByTestId('save-article-btn'))
  await waitFor(() => expect(push).toHaveBeenCalledWith(
    '/site/s/articles/n'))
  expect(m.put).toHaveBeenCalledTimes(3)
  expect(m.put.mock.calls[0][1].summary).toBe('Updated content, renderer')
})

it('keeps a manually edited summary and default text', async () => {
  render(<EditArticlePage />)
  await waitFor(() => expect(screen.getByTestId('monaco'))
    .toHaveValue('c'))
  fireEvent.change(summary(), { target: { value: 'mine' } })
  fireEvent.change(screen.getByTestId('monaco'), { target: { value: 'd' } })
  expect(summary()).toHaveValue('mine')
  fireEvent.change(summary(), { target: { value: '' } })
  fireEvent.click(screen.getByTestId('save-article-btn'))
  await waitFor(() => expect(m.put.mock.calls[0][1].summary)
    .toBe('Updated article'))
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
