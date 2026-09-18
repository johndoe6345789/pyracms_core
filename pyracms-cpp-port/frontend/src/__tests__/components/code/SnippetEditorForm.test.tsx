import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SnippetEditorForm } from '@/components/code/SnippetEditorForm'
import type { SnippetEditor } from '@/hooks/useSnippetEditor'
import api from '@/lib/api'
import { asMockApi } from '../../helpers/mockApi'

jest.mock('@monaco-editor/react', () => ({
  __esModule: true,
  default: () => null,
}))
jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { post: jest.fn() },
}))
const mock = asMockApi<'post'>(api)

const editor = (over: Partial<SnippetEditor> = {}): SnippetEditor => ({
  title: 'T', setTitle: jest.fn(), code: 'x', setCode: jest.fn(),
  language: 'python', setLanguage: jest.fn(), savedId: null,
  saving: false, error: '', save: jest.fn().mockResolvedValue('7'),
  ...over,
})

const setup = (e = editor()) => {
  const onSaved = jest.fn()
  const onCancel = jest.fn()
  render(<SnippetEditorForm editor={e} saveLabel="Save It"
    onSaved={onSaved} onCancel={onCancel} />)
  return { e, onSaved, onCancel }
}

it('edits the title', () => {
  const { e } = setup()
  fireEvent.change(screen.getByTestId('snippet-title-input')
    .querySelector('input')!, { target: { value: 'N' } })
  expect(e.setTitle).toHaveBeenCalledWith('N')
})

it('saves and cancels', async () => {
  const { onSaved, onCancel } = setup()
  fireEvent.click(screen.getByTestId('save-btn'))
  await waitFor(() => expect(onSaved).toHaveBeenCalledWith('7'))
  fireEvent.click(screen.getByTestId('cancel-btn'))
  expect(onCancel).toHaveBeenCalled()
})

it('does not report a failed save', async () => {
  const save = jest.fn().mockResolvedValue(null)
  const { e, onSaved } = setup(editor({ save }))
  fireEvent.click(screen.getByTestId('save-btn'))
  await waitFor(() => expect(e.save).toHaveBeenCalled())
  expect(onSaved).not.toHaveBeenCalled()
})

it('saves then runs and shows output', async () => {
  mock.post.mockResolvedValue({ data: { output: 'out', exitCode: 0 } })
  setup()
  fireEvent.click(screen.getByTestId('run-btn'))
  expect(await screen.findByTestId('code-output-stdout'))
    .toHaveTextContent('out')
})

it('shows errors and blocks invalid states', () => {
  setup(editor({ error: 'nope', title: ' ', language: 'css' }))
  expect(screen.getByText('nope')).toBeInTheDocument()
  expect(screen.getByTestId('save-btn')).toBeDisabled()
  expect(screen.getByTestId('run-btn')).toBeDisabled()
})

it('labels the busy save button', () => {
  setup(editor({ saving: true }))
  expect(screen.getByText('Saving...')).toBeInTheDocument()
})
