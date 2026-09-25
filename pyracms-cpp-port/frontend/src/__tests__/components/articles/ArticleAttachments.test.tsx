import { render, screen } from '@testing-library/react'
import { ArticleAttachments } from '@/components/articles/ArticleAttachments'

const hook = { items: [] as unknown[], busy: false, error: '' }
jest.mock('@/hooks/useArticleAttachments', () => ({
  useArticleAttachments: () => ({
    ...hook,
    upload: jest.fn(),
    remove: jest.fn(),
  }),
}))

const one = { id: 3, fileUuid: 'u', filename: 'a.zip', mimetype: '', size: 9 }

it('shows nothing for visitors when there are no downloads', () => {
  hook.items = []
  const { container } = render(
    <ArticleAttachments name="a" tenantId={1} canManage={false} />,
  )
  expect(container).toBeEmptyDOMElement()
})

it('lists downloads; managers also get attach and remove', () => {
  hook.items = [one]
  hook.error = 'bad'
  render(<ArticleAttachments name="a" tenantId={1} canManage />)
  expect(screen.getByText('a.zip')).toHaveAttribute(
    'href',
    expect.stringMatching(/\/api\/files\/u$/),
  )
  expect(screen.getByTestId('remove-attachment-3')).toBeInTheDocument()
  expect(screen.getByTestId('attach-file-btn')).toBeInTheDocument()
  expect(screen.getByTestId('attachment-error')).toHaveTextContent('bad')
})

it('gives readers only the links', () => {
  hook.items = [one]
  hook.error = ''
  render(<ArticleAttachments name="a" tenantId={1} canManage={false} />)
  expect(screen.queryByTestId('remove-attachment-3')).toBeNull()
  expect(screen.queryByTestId('attach-file-btn')).toBeNull()
})
