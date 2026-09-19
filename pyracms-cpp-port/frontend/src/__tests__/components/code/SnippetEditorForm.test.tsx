import { screen, fireEvent, waitFor } from '@testing-library/react'
import { editor, setup } from '../../helpers/snippetForm'

jest.mock('@monaco-editor/react', () => ({
  __esModule: true,
  default: () => null,
}))
jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { post: jest.fn() },
}))

it('edits the title', () => {
  const { e } = setup()
  fireEvent.change(
    screen.getByTestId('snippet-title-input').querySelector('input')!,
    { target: { value: 'N' } },
  )
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
