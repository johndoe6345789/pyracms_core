import { render, screen, fireEvent, within, act } from '@testing-library/react'
import { BBCodeEditor } from '@/components/articles/BBCodeEditor'
import { insertBBCode } from '@/components/articles/bbcodeInsert'
import { getToolbarActions } from '@/components/articles/toolbarActions'

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

describe('BBCodeEditor', () => {
  afterEach(() => jest.restoreAllMocks())

  it('inserts plain, prompted and list tags', async () => {
    const onChange = jest.fn()
    render(<BBCodeEditor value="hi" onChange={onChange} />)
    select(area('bbcode-textarea'), 0, 2)
    fireEvent.click(screen.getByTestId('bbcode-b'))
    expect(onChange).toHaveBeenLastCalledWith('[b]hi[/b]')
    const prompt = jest.spyOn(window, 'prompt').mockReturnValue('http://u')
    fireEvent.click(screen.getByTestId('bbcode-url'))
    expect(onChange).toHaveBeenLastCalledWith('[url=http://u]hi[/url]')
    prompt.mockReturnValue(null)
    onChange.mockClear()
    fireEvent.click(screen.getByTestId('bbcode-color'))
    expect(onChange).not.toHaveBeenCalled()
    fireEvent.click(screen.getByTestId('bbcode-list'))
    expect(onChange).toHaveBeenCalledTimes(1)
    await act(() => new Promise((r) => setTimeout(r, 10)))
    fireEvent.change(area('bbcode-textarea'), { target: { value: 'q' } })
    expect(screen.getByTestId('preview-content')).toBeInTheDocument()
  })

  it('shows the empty preview', () => {
    render(<BBCodeEditor value="" onChange={jest.fn()} />)
    expect(screen.getByText(/Nothing to preview/)).toBeInTheDocument()
  })
})

it('insertBBCode handles lists and attrs', () => {
  expect(insertBBCode('', 0, 0, 'list').text).toContain('[*]item')
  expect(insertBBCode('a\nb', 0, 3, 'list').text).toContain('[*]a\n[*]b')
  expect(insertBBCode('x', 0, 0, 'b').text).toBe('[b]b[/b]x')
  expect(insertBBCode('x', 0, 1, 'size', '9').text).toBe('[size=9]x[/size]')
})

it('getToolbarActions picks by language', () => {
  expect(getToolbarActions('Markdown')[0]!.prefix).toBe('**')
  expect(getToolbarActions('html')[0]!.prefix).toBe('<strong>')
  expect(getToolbarActions('BBCode')[0]!.prefix).toBe('[b]')
})
