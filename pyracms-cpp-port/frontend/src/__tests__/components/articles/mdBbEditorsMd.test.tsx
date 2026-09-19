import { render, screen, fireEvent, within, act } from '@testing-library/react'
import { MarkdownEditor } from '@/components/articles/MarkdownEditor'

jest.mock('react-markdown', () => ({
  __esModule: true,
  default: ({ children }: { children: string }) => <p>{children}</p>,
}))
jest.mock('remark-gfm', () => ({ __esModule: true, default: () => null }))

const area = (id: string) => {
  const ta = within(screen.getByTestId(id)).getByRole('textbox')
  return ta as HTMLTextAreaElement
}

const select = (ta: HTMLTextAreaElement, a: number, b: number) => {
  ta.setSelectionRange(a, b)
}

it('MarkdownEditor wraps selection and switches views', async () => {
  const onChange = jest.fn()
  render(<MarkdownEditor value="hello" onChange={onChange} />)
  select(area('markdown-textarea'), 0, 5)
  fireEvent.click(screen.getByTestId('toolbar-bold'))
  expect(onChange).toHaveBeenCalledWith('**hello**')
  select(area('markdown-textarea'), 0, 0)
  fireEvent.click(screen.getByTestId('toolbar-italic'))
  expect(onChange).toHaveBeenLastCalledWith('_text_hello')
  await act(() => new Promise((r) => setTimeout(r, 10)))
  fireEvent.change(area('markdown-textarea'), { target: { value: 'z' } })
  expect(onChange).toHaveBeenLastCalledWith('z')
  fireEvent.click(screen.getByTestId('view-mode-edit'))
  expect(screen.queryByTestId('markdown-preview')).toBeNull()
  fireEvent.click(screen.getByTestId('view-mode-preview'))
  expect(screen.queryByTestId('markdown-textarea')).toBeNull()
  fireEvent.click(screen.getByTestId('view-mode-preview'))
})
