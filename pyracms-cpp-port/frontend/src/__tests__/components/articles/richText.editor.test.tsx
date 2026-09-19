import { render } from '@testing-library/react'
import { RichTextEditor } from '@/components/articles/RichTextEditor'
import { editor, state } from '../../helpers/tiptapMock'

jest.mock(
  '@tiptap/react',
  () => jest.requireActual('../../helpers/tiptapMock').tiptapReact,
)
const starterConfigure = jest.fn(() => ({ name: 'starter-kit' }))
jest.mock('@tiptap/starter-kit', () => ({
  __esModule: true,
  default: { configure: (o: unknown) => starterConfigure(o) },
}))
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
  // tiptap 3: the second argument is an options object, not a boolean
  expect(editor.commands.setContent).toHaveBeenCalledWith('<p>b</p>', {
    emitUpdate: false,
  })
  state.onUpdate({ editor })
  expect(onChange).toHaveBeenCalledWith('<p>a</p>')
})

it('RichTextEditor does not register the bundled link twice', () => {
  render(<RichTextEditor value="" onChange={jest.fn()} />)
  // tiptap 3's StarterKit bundles Link; we add our own configured one
  expect(starterConfigure).toHaveBeenCalledWith({ link: false })
})

it('RichTextEditor defers rendering to the client (Next SSR)', () => {
  render(<RichTextEditor value="" onChange={jest.fn()} />)
  expect(state.options.immediatelyRender).toBe(false)
})

it('RichTextEditor renders nothing without an editor', () => {
  state.mockEditor = null
  const { container } = render(<RichTextEditor value="" onChange={jest.fn()} />)
  expect(container).toBeEmptyDOMElement()
})
