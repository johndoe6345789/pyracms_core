import { render, screen, fireEvent } from '@testing-library/react'
import { RichTextEditor } from '@/components/articles/RichTextEditor'
import { RichTextToolbar } from '@/components/articles/RichTextToolbar'

const chain: Record<string, jest.Mock> = {}
;['focus', 'toggleBold', 'toggleItalic', 'toggleHeading',
  'toggleBulletList', 'toggleOrderedList', 'toggleCodeBlock',
  'toggleBlockquote', 'setLink', 'setImage', 'run',
].forEach((k) => { chain[k] = jest.fn(() => chain) })

const editor = {
  chain: () => chain,
  isActive: jest.fn((n: string) => n === 'bold'),
  getHTML: jest.fn(() => '<p>a</p>'),
  commands: { setContent: jest.fn() },
}
let mockEditor: unknown = editor
let onUpdate: (a: { editor: typeof editor }) => void = () => {}

jest.mock('@tiptap/react', () => ({
  useEditor: (o: { onUpdate: typeof onUpdate }) => {
    onUpdate = o.onUpdate
    return mockEditor
  },
  EditorContent: () => <div data-testid="rich-text-content" />,
}))
jest.mock('@tiptap/starter-kit', () => ({ __esModule: true, default: {} }))
jest.mock('@tiptap/extension-link', () => ({
  __esModule: true, default: { configure: () => ({}) },
}))
jest.mock('@tiptap/extension-image', () => ({ __esModule: true, default: {} }))

beforeEach(() => {
  mockEditor = editor
  jest.clearAllMocks()
})

it('toolbar buttons run editor commands', () => {
  render(<RichTextToolbar editor={editor as never} />)
  for (const id of ['bold', 'italic', 'heading-2', 'heading-3',
    'bullet-list', 'ordered-list', 'code-block', 'blockquote']) {
    fireEvent.click(screen.getByTestId(`rich-${id}`))
  }
  expect(chain.toggleBold).toHaveBeenCalled()
  expect(chain.toggleHeading).toHaveBeenCalledWith({ level: 3 })
})

it('link and image prompt for urls', () => {
  render(<RichTextToolbar editor={editor as never} />)
  const prompt = jest.spyOn(window, 'prompt').mockReturnValue('http://x')
  fireEvent.click(screen.getByTestId('rich-link'))
  fireEvent.click(screen.getByTestId('rich-image'))
  expect(chain.setLink).toHaveBeenCalledWith({ href: 'http://x' })
  expect(chain.setImage).toHaveBeenCalledWith({ src: 'http://x' })
  prompt.mockReturnValue(null)
  fireEvent.click(screen.getByTestId('rich-link'))
  fireEvent.click(screen.getByTestId('rich-image'))
  expect(chain.setLink).toHaveBeenCalledTimes(1)
  prompt.mockRestore()
})

it('RichTextEditor syncs content and reports updates', () => {
  const onChange = jest.fn()
  const { rerender } = render(<RichTextEditor value="<p>a</p>"
    onChange={onChange} />)
  expect(editor.commands.setContent).not.toHaveBeenCalled()
  rerender(<RichTextEditor value="<p>b</p>" onChange={onChange} />)
  expect(editor.commands.setContent).toHaveBeenCalledWith('<p>b</p>', false)
  onUpdate({ editor })
  expect(onChange).toHaveBeenCalledWith('<p>a</p>')
})

it('RichTextEditor renders nothing without an editor', () => {
  mockEditor = null
  const { container } = render(<RichTextEditor value="" onChange={jest.fn()} />)
  expect(container).toBeEmptyDOMElement()
})
