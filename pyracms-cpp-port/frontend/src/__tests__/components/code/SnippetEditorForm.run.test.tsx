import { screen, fireEvent } from '@testing-library/react'
import { mock, editor, setup } from '../../helpers/snippetForm'

jest.mock('@monaco-editor/react', () => ({
  __esModule: true,
  default: () => null,
}))
jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { post: jest.fn() },
}))

it('saves then runs and shows output', async () => {
  mock.post.mockResolvedValue({ data: { output: 'out', exitCode: 0 } })
  setup()
  fireEvent.click(screen.getByTestId('run-btn'))
  expect(await screen.findByTestId('code-output-stdout')).toHaveTextContent(
    'out',
  )
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

it('offers a change note only for an already saved snippet', () => {
  const setSummary = jest.fn()
  setup(editor({ savedId: '7', setSummary }))
  fireEvent.change(
    screen.getByTestId('snippet-summary-input').querySelector('input')!,
    { target: { value: 'why' } },
  )
  expect(setSummary).toHaveBeenCalledWith('why')
})
