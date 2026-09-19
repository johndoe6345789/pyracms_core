import { render, screen, fireEvent, within } from '@testing-library/react'
import AddMenuItemBar from '@/components/admin/AddMenuItemBar'
import AddSettingForm from '@/components/admin/AddSettingForm'
import ConfirmDialog from '@/components/admin/ConfirmDialog'

const box = (id: string) =>
  within(screen.getByTestId(id)).getByRole('textbox')

it('AddMenuItemBar emits and gates add', () => {
  const p = { onLabelChange: jest.fn(), onUrlChange: jest.fn(),
    onAdd: jest.fn() }
  const { rerender } = render(<AddMenuItemBar label="" url="" {...p} />)
  expect(screen.getByTestId('add-menu-item-btn')).toBeDisabled()
  rerender(<AddMenuItemBar label="a" url="/b" {...p} />)
  fireEvent.change(box('new-label-input'), { target: { value: 'x' } })
  fireEvent.change(box('new-url-input'), { target: { value: '/y' } })
  fireEvent.click(screen.getByTestId('add-menu-item-btn'))
  expect(p.onLabelChange).toHaveBeenCalledWith('x')
  expect(p.onUrlChange).toHaveBeenCalledWith('/y')
  expect(p.onAdd).toHaveBeenCalled()
})

it('AddSettingForm emits and gates add', () => {
  const p = { onKeyChange: jest.fn(), onValueChange: jest.fn(),
    onAdd: jest.fn() }
  const { rerender } = render(
    <AddSettingForm newKey="" newValue="" {...p} />)
  expect(screen.getByTestId('add-setting-btn')).toBeDisabled()
  rerender(<AddSettingForm newKey="k" newValue="v" {...p} />)
  fireEvent.change(box('setting-key-input'), { target: { value: 'a' } })
  fireEvent.change(box('setting-value-input'), { target: { value: 'b' } })
  fireEvent.click(screen.getByTestId('add-setting-btn'))
  expect(p.onKeyChange).toHaveBeenCalledWith('a')
  expect(p.onValueChange).toHaveBeenCalledWith('b')
  expect(p.onAdd).toHaveBeenCalled()
})

it('ConfirmDialog confirms and cancels', () => {
  const onConfirm = jest.fn()
  const onCancel = jest.fn()
  const { rerender } = render(
    <ConfirmDialog open title="T" message="M" onConfirm={onConfirm}
      onCancel={onCancel} />)
  expect(screen.getByText('Delete', { selector: 'button' })).toBeVisible()
  fireEvent.click(screen.getByTestId('confirm-submit-btn'))
  fireEvent.click(screen.getByTestId('confirm-cancel-btn'))
  expect(onConfirm).toHaveBeenCalled()
  expect(onCancel).toHaveBeenCalled()
  rerender(
    <ConfirmDialog open title="T" message="M" confirmLabel="Go"
      onConfirm={onConfirm} onCancel={onCancel} />)
  expect(screen.getByText('Go')).toBeInTheDocument()
})
