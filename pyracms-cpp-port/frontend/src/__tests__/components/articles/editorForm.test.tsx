import {
  render, screen, fireEvent, within, renderHook, act,
} from '@testing-library/react'
import { ArticleEditorForm } from '@/components/articles/ArticleEditorForm'
import {
  ArticleEditorContent,
} from '@/components/articles/ArticleEditorContent'
import { useArticleEditor } from '@/hooks/useArticleEditor'

jest.mock('@/components/articles/MonacoEditor', () => ({
  MonacoEditorComponent: (
    p: { value: string; onChange: (v: string) => void },
  ) =>
    <button data-testid="monaco" onClick={() => p.onChange('M')}>
      {p.value}
    </button>,
}))
jest.mock('@/components/articles/RichTextEditor', () => ({
  RichTextEditor: () => <i data-testid="rich" />,
}))
jest.mock('@/components/articles/BBCodeEditor', () => ({
  BBCodeEditor: () => <i data-testid="bb" />,
}))
jest.mock('@/components/articles/MarkdownEditor', () => ({
  MarkdownEditor: () => <i data-testid="md" />,
}))

const editor = () => renderHook(() => useArticleEditor({ content: 'c' }))

it('ArticleEditorContent renders each mode', () => {
  const { result } = editor()
  const { rerender } = render(
    <ArticleEditorContent mode="wysiwyg" editor={result.current} />)
  expect(screen.getByTestId('rich')).toBeInTheDocument()
  rerender(<ArticleEditorContent mode="bbcode" editor={result.current} />)
  expect(screen.getByTestId('bb')).toBeInTheDocument()
  rerender(<ArticleEditorContent mode="markdown" editor={result.current} />)
  expect(screen.getByTestId('md')).toBeInTheDocument()
  rerender(<ArticleEditorContent mode={'x' as never}
    editor={result.current} />)
  expect(screen.queryByTestId('md')).toBeNull()
})

it('ArticleEditorContent monaco toggles preview', () => {
  const { result } = editor()
  const { rerender } = render(
    <ArticleEditorContent mode="monaco" editor={result.current} />)
  fireEvent.click(screen.getByTestId('monaco'))
  act(() => result.current.setViewMode('preview'))
  rerender(<ArticleEditorContent mode="monaco" editor={result.current} />)
  expect(screen.getByText(/Preview \(Markdown\)/)).toBeInTheDocument()
})

it('ArticleEditorForm edits fields', () => {
  const { result } = editor()
  const onSummaryChange = jest.fn()
  const { rerender } = render(<ArticleEditorForm editor={result.current}
    onSummaryChange={onSummaryChange} />)
  const box = (id: string) =>
    within(screen.getByTestId(id)).getByRole('textbox')
  fireEvent.change(box('article-title-input'), { target: { value: 'T' } })
  fireEvent.change(box('summary-input'), { target: { value: 'S' } })
  expect(onSummaryChange).toHaveBeenCalledWith('S')
  fireEvent.mouseDown(within(screen.getByTestId('renderer-select'))
    .getByRole('combobox'))
  fireEvent.click(screen.getByRole('option', { name: 'HTML' }))
  fireEvent.click(screen.getByRole('button', { name: /WYSIWYG/ }))
  expect(screen.getByTestId('rich')).toBeInTheDocument()
  rerender(<ArticleEditorForm editor={result.current} />)
  fireEvent.change(box('summary-input'), { target: { value: 'S2' } })
})
