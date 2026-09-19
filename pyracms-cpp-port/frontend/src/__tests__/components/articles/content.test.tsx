import { render, screen } from '@testing-library/react'
import { ArticleContent } from '@/components/articles/ArticleContent'
import { ContentPreview } from '@/components/articles/ContentPreview'
import {
  EditorPreviewPane,
  EmptyPreview,
  HtmlPreviewContent,
} from '@/components/articles/EditorPreviewPane'

jest.mock('react-markdown', () => ({
  __esModule: true,
  default: ({ children }: { children: string }) => <p>{children}</p>,
}))
jest.mock('remark-gfm', () => ({ __esModule: true, default: () => null }))

it('ArticleContent switches on renderer', () => {
  const { rerender } = render(
    <ArticleContent content="<b>hi</b><script>x</script>" renderer="html" />,
  )
  expect(screen.getByTestId('article-content').innerHTML).not.toContain(
    'script',
  )
  rerender(<ArticleContent content="# md" renderer="markdown" />)
  expect(screen.getByTestId('markdown-preview')).toHaveTextContent('# md')
})

it('ContentPreview shows content or placeholder', () => {
  const { rerender } = render(
    <ContentPreview content="<i>a</i>" renderer="HTML" />,
  )
  expect(screen.getByTestId('content-preview').innerHTML).toContain('<i>')
  rerender(<ContentPreview content="" renderer="HTML" />)
  expect(screen.getByText(/Nothing to preview/)).toBeInTheDocument()
})

it('preview pane pieces render', () => {
  render(
    <EditorPreviewPane label="L">
      <EmptyPreview message="none" />
      <HtmlPreviewContent sanitizedHtml="<b>x</b>" sx={{ color: 'red' }} />
      <HtmlPreviewContent sanitizedHtml="<u>y</u>" />
    </EditorPreviewPane>,
  )
  expect(screen.getByText('L')).toBeInTheDocument()
  expect(screen.getByText('none')).toBeInTheDocument()
  expect(screen.getAllByTestId('preview-content')).toHaveLength(2)
})
