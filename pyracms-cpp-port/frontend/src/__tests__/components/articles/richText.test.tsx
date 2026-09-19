import { render, screen, fireEvent } from '@testing-library/react'
import { RichTextToolbar } from '@/components/articles/RichTextToolbar'
import { chain, editor, state } from '../../helpers/tiptapMock'

jest.mock(
  '@tiptap/react',
  () => jest.requireActual('../../helpers/tiptapMock').tiptapReact,
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

it('toolbar buttons run editor commands', () => {
  render(<RichTextToolbar editor={editor as never} />)
  for (const id of [
    'bold',
    'italic',
    'heading-2',
    'heading-3',
    'bullet-list',
    'ordered-list',
    'code-block',
    'blockquote',
  ]) {
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
