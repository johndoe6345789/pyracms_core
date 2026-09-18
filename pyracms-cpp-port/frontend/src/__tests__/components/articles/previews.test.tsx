import { render, screen } from '@testing-library/react'
import {
  EditorPreviewPane, EmptyPreview, HtmlPreviewContent,
} from '@/components/articles/EditorPreviewPane'
import { ContentPreview } from '@/components/articles/ContentPreview'
import { MarkdownPreview } from '@/components/articles/MarkdownPreview'
import { TIPTAP_STYLES } from '@/components/articles/tiptapStyles'

jest.mock('react-markdown', () => ({
  __esModule: true,
  default: ({ children }: { children: string }) => <p>{children}</p>,
}))
jest.mock('remark-gfm', () => ({ __esModule: true, default: {} }))

it('renders preview pane with label', () => {
  render(<EditorPreviewPane label="L"><i>kid</i></EditorPreviewPane>)
  expect(screen.getByText('L')).toBeInTheDocument()
  expect(screen.getByText('kid')).toBeInTheDocument()
})

it('uses default label and empty message', () => {
  render(<EditorPreviewPane><EmptyPreview /></EditorPreviewPane>)
  expect(screen.getByText('Preview')).toBeInTheDocument()
  expect(screen.getByText('Nothing to preview yet.'))
    .toBeInTheDocument()
})

it('renders custom empty message', () => {
  render(<EmptyPreview message="none" />)
  expect(screen.getByText('none')).toBeInTheDocument()
})

it('renders html with and without sx', () => {
  const { rerender } =
    render(<HtmlPreviewContent sanitizedHtml="<b>x</b>" />)
  expect(screen.getByTestId('preview-content').innerHTML)
    .toBe('<b>x</b>')
  rerender(<HtmlPreviewContent sanitizedHtml="y" sx={{ p: 1 }} />)
  expect(screen.getByTestId('preview-content')).toHaveTextContent('y')
})

it('content preview sanitizes and shows empty state', () => {
  const { rerender } = render(<ContentPreview renderer="html"
    content="<i>a</i><script>x</script>" />)
  expect(screen.getByTestId('content-preview').innerHTML)
    .toBe('<i>a</i>')
  expect(screen.getByText('Preview (html)')).toBeInTheDocument()
  rerender(<ContentPreview renderer="html" content="" />)
  expect(screen.queryByTestId('content-preview')).toBeNull()
  expect(screen.getByText(/Nothing to preview yet/)).toBeInTheDocument()
})

it('markdown preview falls back when empty', () => {
  const { rerender } = render(<MarkdownPreview value="" />)
  expect(screen.getByTestId('markdown-preview'))
    .toHaveTextContent('Nothing to preview yet.')
  rerender(<MarkdownPreview value="hey" />)
  expect(screen.getByTestId('markdown-preview')).toHaveTextContent('hey')
})

it('exports tiptap styles', () => {
  expect(TIPTAP_STYLES).toContain('.tiptap')
})
