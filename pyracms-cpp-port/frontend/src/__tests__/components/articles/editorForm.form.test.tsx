import { render, screen, fireEvent, within } from '@testing-library/react'
import { ArticleEditorForm } from '@/components/articles/ArticleEditorForm'
import { editor } from '../../helpers/articleEditorMocks'

jest.mock('@/components/articles/MonacoEditor', () => {
  return require('../../helpers/articleEditorMocks').monaco
})
jest.mock('@/components/articles/RichTextEditor', () => {
  return require('../../helpers/articleEditorMocks').rich
})
jest.mock('@/components/articles/BBCodeEditor', () => {
  return require('../../helpers/articleEditorMocks').bb
})
jest.mock('@/components/articles/MarkdownEditor', () => {
  return require('../../helpers/articleEditorMocks').md
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
  fireEvent.click(screen.getByRole('button', { name: /WYSIWYG/ }))
  expect(screen.getByTestId('rich')).toBeInTheDocument()
  rerender(<ArticleEditorForm editor={result.current} />)
  fireEvent.change(box('summary-input'), { target: { value: 'S2' } })
})
