import { render, screen, fireEvent, act } from '@testing-library/react'
import { ArticleEditorContent } from '../../helpers/imports/editorContent'
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

it('ArticleEditorContent renders each mode', () => {
  const { result } = editor()
  const { rerender } = render(
    <ArticleEditorContent mode="wysiwyg" editor={result.current} />,
  )
  expect(screen.getByTestId('rich')).toBeInTheDocument()
  rerender(<ArticleEditorContent mode="bbcode" editor={result.current} />)
  expect(screen.getByTestId('bb')).toBeInTheDocument()
  rerender(<ArticleEditorContent mode="markdown" editor={result.current} />)
  expect(screen.getByTestId('md')).toBeInTheDocument()
  rerender(<ArticleEditorContent mode={'x' as never} editor={result.current} />)
  expect(screen.queryByTestId('md')).toBeNull()
})

it('ArticleEditorContent monaco toggles preview', () => {
  const { result } = editor()
  const { rerender } = render(
    <ArticleEditorContent mode="monaco" editor={result.current} />,
  )
  fireEvent.click(screen.getByTestId('monaco'))
  act(() => result.current.setViewMode('preview'))
  rerender(<ArticleEditorContent mode="monaco" editor={result.current} />)
  expect(screen.getByText(/Preview \(Markdown\)/)).toBeInTheDocument()
})
