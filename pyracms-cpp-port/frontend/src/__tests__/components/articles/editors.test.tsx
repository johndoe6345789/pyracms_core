import { render, screen, fireEvent, act } from '@testing-library/react'
import { MarkdownEditor } from '@/components/articles/MarkdownEditor'
import { EditorToolbar } from '@/components/articles/EditorToolbar'
import {
  getToolbarActions, getMarkdownActions, MARKDOWN_ACTIONS,
  HTML_ACTIONS, BBCODE_ACTIONS,
} from '@/components/articles/toolbarActions'

jest.mock('react-markdown', () => ({
  __esModule: true,
  default: ({ children }: { children: string }) => <p>{children}</p>,
}))
jest.mock('remark-gfm', () => ({ __esModule: true, default: {} }))

it('picks toolbar actions by language', () => {
  expect(getToolbarActions('Markdown')).toBe(MARKDOWN_ACTIONS)
  expect(getToolbarActions('markdown')).toBe(MARKDOWN_ACTIONS)
  expect(getToolbarActions('HTML')).toBe(HTML_ACTIONS)
  expect(getToolbarActions('BBCode')).toBe(BBCODE_ACTIONS)
  expect(getMarkdownActions()).toBe(MARKDOWN_ACTIONS)
})

it('toolbar fires actions and renders children', () => {
  const on = jest.fn()
  render(<EditorToolbar actions={BBCODE_ACTIONS} onAction={on}>
    <span>kid</span></EditorToolbar>)
  fireEvent.click(screen.getByTestId('toolbar-bold'))
  expect(on).toHaveBeenCalledWith('[b]', '[/b]')
  expect(screen.getByText('kid')).toBeInTheDocument()
})

describe('MarkdownEditor', () => {
  beforeEach(() => jest.useFakeTimers())
  afterEach(() => jest.useRealTimers())

  it('edits and inserts formatting', () => {
    const onChange = jest.fn()
    render(<MarkdownEditor value="abc" onChange={onChange} />)
    const ta = screen.getByTestId('markdown-textarea')
      .querySelector('textarea')!
    fireEvent.change(ta, { target: { value: 'z' } })
    expect(onChange).toHaveBeenLastCalledWith('z')
    ta.setSelectionRange(1, 2)
    fireEvent.click(screen.getByTestId('toolbar-bold'))
    expect(onChange).toHaveBeenLastCalledWith('a**b**c')
    act(() => { jest.runAllTimers() })
  })

  it('uses placeholder text when nothing selected', () => {
    const onChange = jest.fn()
    render(<MarkdownEditor value="" onChange={onChange} />)
    fireEvent.click(screen.getByTestId('toolbar-italic'))
    expect(onChange).toHaveBeenLastCalledWith('_text_')
  })

  it('toggles view modes', () => {
    render(<MarkdownEditor value="q" onChange={jest.fn()} />)
    expect(screen.getByTestId('markdown-preview')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('view-mode-edit'))
    expect(screen.queryByTestId('markdown-preview')).toBeNull()
    fireEvent.click(screen.getByTestId('view-mode-preview'))
    expect(screen.queryByTestId('markdown-textarea')).toBeNull()
    expect(screen.getByTestId('markdown-preview')).toBeInTheDocument()
  })
})
