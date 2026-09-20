import { render, screen, fireEvent, within } from '@testing-library/react'
import { ArticleEditorForm } from '@/components/articles/ArticleEditorForm'
import { editor } from '../../helpers/articleEditorMocks'

jest.mock('@/components/articles/MonacoEditor', () => {
  return jest.requireActual('../../helpers/articleEditorMocks').monaco
})
jest.mock('@/components/articles/RichTextEditor', () => {
  return jest.requireActual('../../helpers/articleEditorMocks').rich
})
jest.mock('@/components/articles/BBCodeEditor', () => {
  return jest.requireActual('../../helpers/articleEditorMocks').bb
})
jest.mock('@/components/articles/MarkdownEditor', () => {
  return jest.requireActual('../../helpers/articleEditorMocks').md
})

it('ArticleEditorForm edits fields', () => {
  const { result } = editor()
  const onSummaryChange = jest.fn()
  const { rerender } = render(
    <ArticleEditorForm
      editor={result.current}
      onSummaryChange={onSummaryChange}
    />,
  )
  const box = (id: string) =>
    within(screen.getByTestId(id)).getByRole('textbox')
  fireEvent.change(box('article-title-input'), { target: { value: 'T' } })
  fireEvent.change(box('summary-input'), { target: { value: 'S' } })
  expect(onSummaryChange).toHaveBeenCalledWith('S')
  fireEvent.mouseDown(
    within(screen.getByTestId('renderer-select')).getByRole('combobox'),
  )
  fireEvent.click(screen.getByRole('option', { name: 'HTML' }))
  // choosing HTML picks the WYSIWYG editor by itself
  rerender(<ArticleEditorForm editor={result.current} />)
  expect(screen.getByTestId('rich')).toBeInTheDocument()
  fireEvent.change(box('summary-input'), { target: { value: 'S2' } })
})
