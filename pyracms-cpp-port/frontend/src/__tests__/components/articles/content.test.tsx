import { render, screen } from '@testing-library/react'
import { ArticleContent } from '@/components/articles/ArticleContent'
import { ContentPreview } from '@/components/articles/ContentPreview'
import {
  EditorPreviewPane,
  EmptyPreview,
  HtmlPreviewContent,
} from '@/components/articles/EditorPreviewPane'
import { renderBBCode } from '@/components/articles/bbcodeRenderer'
import { RevisionViewDialog } from '@/components/articles/RevisionViewDialog'
import { RevertConfirmDialog } from '@/components/articles/RevertConfirmDialog'

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

it('renderBBCode converts every tag', () => {
  const html = renderBBCode(
    '[b]b[/b][i]i[/i][u]u[/u][url=http://a]l[/url][url]http://b[/url]' +
      '[img]http://i.png[/img][code]c[/code][quote]q[/quote]' +
      '[list][*]one[*]two[/list][color=red]r[/color][size=9]s[/size]\nx',
  )
  for (const t of [
    '<strong>',
    '<em>',
    '<u>',
    'href="http://a"',
    '<img',
    '<pre',
    '<blockquote',
    '<li>one</li>',
    'color',
    'font-size',
    '<br',
  ]) {
    expect(html).toContain(t)
  }
})

it('revision dialogs render and close', () => {
  const rev = { number: 3, author: 'a', date: 'd', summary: 's' }
  const { rerender } = render(
    <RevisionViewDialog
      open
      onClose={jest.fn()}
      revision={rev}
      sanitizedContent="<b>c</b>"
    />,
  )
  expect(screen.getByTestId('revision-content').innerHTML).toContain('<b>')
  rerender(
    <RevisionViewDialog
      open
      onClose={jest.fn()}
      revision={null}
      sanitizedContent=""
    />,
  )
  render(
    <RevertConfirmDialog
      revisionNumber={4}
      onClose={jest.fn()}
      onConfirm={jest.fn()}
    />,
  )
  expect(screen.getByText(/Revert to revision 4/)).toBeInTheDocument()
})
