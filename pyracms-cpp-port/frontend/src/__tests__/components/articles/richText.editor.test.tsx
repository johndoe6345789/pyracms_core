import { render } from '@testing-library/react'
import { RichTextEditor } from '@/components/articles/RichTextEditor'
import { editor, state } from '../../helpers/tiptapMock'

jest.mock(
  '@tiptap/react',
  () => require('../../helpers/tiptapMock').tiptapReact,
)
jest.mock('@tiptap/starter-kit', () => ({ __esModule: true, default: {} }))
jest.mock('@tiptap/extension-link', () => ({
  __esModule: true,
  default: { configure: () => ({}) },
}))
jest.mock('@tiptap/extension-image', () => ({ __esModule: true, default: {} }))

beforeEach(() => {
  state.mockEditor = editor
  jest.clearAllMocks()
})

it('RichTextEditor syncs content and reports updates', () => {
  const onChange = jest.fn()
  const { rerender } = render(
    <RichTextEditor value="<p>a</p>" onChange={onChange} />,
  )
  expect(editor.commands.setContent).not.toHaveBeenCalled()
  rerender(<RichTextEditor value="<p>b</p>" onChange={onChange} />)
  expect(editor.commands.setContent).toHaveBeenCalledWith('<p>b</p>', false)
  state.onUpdate({ editor })
  expect(onChange).toHaveBeenCalledWith('<p>a</p>')
})

it('RichTextEditor renders nothing without an editor', () => {
  state.mockEditor = null
  const { container } = render(<RichTextEditor value="" onChange={jest.fn()} />)
  expect(container).toBeEmptyDOMElement()
})
