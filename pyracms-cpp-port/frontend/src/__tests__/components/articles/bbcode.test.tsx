import { render, screen, fireEvent, act } from '@testing-library/react'
import { renderBBCode } from '@/components/articles/bbcodeRenderer'
import { insertBBCode } from '@/components/articles/bbcodeInsert'
import { BBCodeEditor } from '@/components/articles/BBCodeEditor'
import { BBCodeToolbar } from '@/components/articles/BBCodeToolbar'

it('renders all bbcode tags', () => {
  const src = '[b]b[/b][i]i[/i][u]u[/u][url=http://x.y]l[/url]'
    + '[url]http://z.y[/url][img]http://i.png[/img][code]c[/code]'
    + '[quote]q[/quote][list][*]one[*]two[/list]'
    + '[color=red]r[/color][size=20]s[/size]\nend'
  const html = renderBBCode(src)
  const parts = ['<strong>b', '<em>i', '<u>u', 'href="http://x.y"',
    '<pre', '<blockquote', '<li>one</li>', 'color:red',
    'font-size:20px', '<br>']
  parts.forEach((s) => expect(html).toContain(s))
})

it('inserts around a selection and empty selection', () => {
  expect(insertBBCode('abc', 1, 2, 'b')).toEqual(
    { text: 'a[b]b[/b]c', cursor: 5 })
  expect(insertBBCode('', 0, 0, 'i').text).toBe('[i]i[/i]')
  expect(insertBBCode('a', 0, 1, 'url', 'x').text)
    .toBe('[url=x]a[/url]')
})

it('inserts lists', () => {
  expect(insertBBCode('', 0, 0, 'list').text)
    .toBe('[list]\n[*]item\n[/list]')
  expect(insertBBCode('a\nb', 0, 3, 'list').text)
    .toBe('[list]\n[*]a\n[*]b\n[/list]')
})

it('toolbar passes tag info', () => {
  const on = jest.fn()
  render(<BBCodeToolbar onInsertTag={on} />)
  fireEvent.click(screen.getByTestId('bbcode-b'))
  fireEvent.click(screen.getByTestId('bbcode-url'))
  expect(on).toHaveBeenCalledWith('b', undefined, undefined)
  expect(on).toHaveBeenCalledWith('url', true, 'Enter URL:')
})

describe('BBCodeEditor', () => {
  beforeEach(() => jest.useFakeTimers())
  afterEach(() => jest.useRealTimers())

  it('shows empty preview and edits', () => {
    const onChange = jest.fn()
    render(<BBCodeEditor value="" onChange={onChange} />)
    expect(screen.getByText('Nothing to preview yet.'))
      .toBeInTheDocument()
    fireEvent.change(
      screen.getByTestId('bbcode-textarea').querySelector('textarea')!,
      { target: { value: 'x' } })
    expect(onChange).toHaveBeenCalledWith('x')
  })

  it('inserts tags and prompts for attributes', () => {
    const onChange = jest.fn()
    const prompt = jest.spyOn(window, 'prompt')
    render(<BBCodeEditor value="hi" onChange={onChange} />)
    expect(screen.getByTestId('preview-content')).toHaveTextContent('hi')
    fireEvent.click(screen.getByTestId('bbcode-b'))
    expect(onChange).toHaveBeenLastCalledWith('[b]b[/b]hi')
    act(() => { jest.runAllTimers() })
    prompt.mockReturnValueOnce(null)
    fireEvent.click(screen.getByTestId('bbcode-url'))
    expect(onChange).toHaveBeenCalledTimes(1)
    prompt.mockReturnValueOnce('http://a')
    fireEvent.click(screen.getByTestId('bbcode-url'))
    expect(onChange).toHaveBeenLastCalledWith(
      '[url=http://a]url[/url]hi')
    fireEvent.click(screen.getByTestId('bbcode-list'))
    expect(onChange).toHaveBeenLastCalledWith(
      '[list]\n[*]item\n[/list]hi')
    prompt.mockRestore()
  })
})
