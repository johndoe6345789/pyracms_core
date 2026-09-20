import { render, screen, fireEvent, within } from '@testing-library/react'
import { ArticleEditorForm } from '@/components/articles/ArticleEditorForm'
import { defaultModeFor } from '@/components/articles/editorModes'
import { editor } from '../../helpers/articleEditorMocks'

jest.mock(
  '@/components/articles/MonacoEditor',
  () => jest.requireActual('../../helpers/articleEditorMocks').monaco,
)
jest.mock(
  '@/components/articles/RichTextEditor',
  () => jest.requireActual('../../helpers/articleEditorMocks').rich,
)
jest.mock(
  '@/components/articles/BBCodeEditor',
  () => jest.requireActual('../../helpers/articleEditorMocks').bb,
)
jest.mock(
  '@/components/articles/MarkdownEditor',
  () => jest.requireActual('../../helpers/articleEditorMocks').md,
)

describe('defaultModeFor', () => {
  it.each([
    ['HTML', 'wysiwyg'],
    ['Markdown', 'markdown'],
    ['BBCode', 'bbcode'],
    ['reStructuredText', 'monaco'],
    ['restructuredtext', 'monaco'],
    ['something-else', 'monaco'],
  ])('%s -> %s', (renderer, mode) => {
    expect(defaultModeFor(renderer)).toBe(mode)
  })
})

describe('ArticleEditorForm', () => {
  const choose = (name: string) => {
    fireEvent.mouseDown(
      within(screen.getByTestId('renderer-select')).getByRole('combobox'),
    )
    fireEvent.click(screen.getByRole('option', { name }))
  }

  it('starts in the editor that suits the default renderer', () => {
    const { result } = editor()
    render(<ArticleEditorForm editor={result.current} />)
    expect(screen.getByTestId('md')).toBeInTheDocument()
  })

  it.each([
    ['HTML', 'rich'],
    ['BBCode', 'bb'],
    ['reStructuredText', 'monaco'],
    ['Markdown', 'md'],
  ])('switches to the %s editor when the renderer changes', (name, id) => {
    const { result } = editor()
    const { rerender } = render(<ArticleEditorForm editor={result.current} />)
    choose(name)
    rerender(<ArticleEditorForm editor={result.current} />)
    expect(screen.getByTestId(id)).toBeInTheDocument()
  })
})
