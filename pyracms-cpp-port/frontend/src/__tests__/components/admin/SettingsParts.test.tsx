import { render, screen, fireEvent, within } from '@testing-library/react'
import SettingsTable from '@/components/admin/SettingsTable'
import AddSettingForm from '@/components/admin/AddSettingForm'

const settings = [
  { id: 1, key: 'a', value: 'one' },
  { id: 2, key: 'b', value: 'two' },
]

function table(editingId: number | null) {
  const p = {
    settings, editingId, editValue: 'ev',
    onEditValueChange: jest.fn(), onStartEdit: jest.fn(),
    onSaveEdit: jest.fn(), onCancelEdit: jest.fn(),
    onDelete: jest.fn(),
  }
  render(<SettingsTable {...p} />)
  return p
}

it('renders view rows with edit and delete actions', () => {
  const p = table(null)
  expect(screen.getByText('one')).toBeInTheDocument()
  fireEvent.click(screen.getAllByTestId('edit-setting-btn')[1]!)
  expect(p.onStartEdit).toHaveBeenCalledWith(settings[1])
  fireEvent.click(screen.getAllByTestId('delete-setting-btn')[0]!)
  expect(p.onDelete).toHaveBeenCalledWith(1)
})

it('renders the editing row with save and cancel', () => {
  const p = table(1)
  const input = within(screen.getByTestId('setting-value-input'))
    .getByRole('textbox')
  fireEvent.change(input, { target: { value: 'n' } })
  expect(p.onEditValueChange).toHaveBeenCalledWith('n')
  fireEvent.keyDown(input, { key: 'Enter' })
  expect(p.onSaveEdit).toHaveBeenCalledWith(1)
  fireEvent.keyDown(input, { key: 'Escape' })
  expect(p.onCancelEdit).toHaveBeenCalledTimes(1)
  fireEvent.keyDown(input, { key: 'a' })
  fireEvent.click(screen.getByTestId('save-setting-btn'))
  expect(p.onSaveEdit).toHaveBeenCalledTimes(2)
  fireEvent.click(screen.getByTestId('cancel-setting-btn'))
  expect(p.onCancelEdit).toHaveBeenCalledTimes(2)
})

it('add form validates and reports input', () => {
  const p = {
    onKeyChange: jest.fn(), onValueChange: jest.fn(), onAdd: jest.fn(),
  }
  const { rerender } = render(
    <AddSettingForm newKey="" newValue="" {...p} />)
  expect(screen.getByTestId('add-setting-btn')).toBeDisabled()
  rerender(<AddSettingForm newKey="k" newValue="v" {...p} />)
  const box = (id: string) =>
    within(screen.getByTestId(id)).getByRole('textbox')
  fireEvent.change(box('setting-key-input'), { target: { value: 'x' } })
  fireEvent.change(box('setting-value-input'), { target: { value: 'y' } })
  fireEvent.click(screen.getByTestId('add-setting-btn'))
  expect(p.onKeyChange).toHaveBeenCalledWith('x')
  expect(p.onValueChange).toHaveBeenCalledWith('y')
  expect(p.onAdd).toHaveBeenCalled()
})
