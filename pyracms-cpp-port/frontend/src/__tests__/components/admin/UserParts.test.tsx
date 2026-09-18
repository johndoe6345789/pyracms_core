import { render, screen, fireEvent } from '@testing-library/react'
import UserTable from '@/components/admin/UserTable'
import UserActions from '@/components/admin/UserActions'
import ConfirmDialog from '@/components/admin/ConfirmDialog'

const active = {
  id: 1, username: 'ann', email: 'a@x', created: '2024-01-01',
  banned: false,
}
const banned = { ...active, id: 2, username: 'bob', banned: true }

it('renders users with status chips and actions', () => {
  const onToggleBan = jest.fn()
  const onDelete = jest.fn()
  render(
    <UserTable
      users={[active, banned]}
      onToggleBan={onToggleBan}
      onDelete={onDelete}
    />,
  )
  expect(screen.getByTestId('user-row-1')).toHaveTextContent('Active')
  expect(screen.getByTestId('user-row-2')).toHaveTextContent('Banned')
  fireEvent.click(screen.getByTestId('ban-user-2'))
  expect(onToggleBan).toHaveBeenCalledWith(2)
  fireEvent.click(screen.getByTestId('delete-user-1'))
  expect(onDelete).toHaveBeenCalledWith(active)
})

it('edit works with and without a handler', () => {
  const onEdit = jest.fn()
  const { rerender } = render(
    <UserActions
      user={active} onToggleBan={jest.fn()}
      onDelete={jest.fn()} onEdit={onEdit}
    />,
  )
  fireEvent.click(screen.getByTestId('edit-user-1'))
  expect(onEdit).toHaveBeenCalledWith(active)
  rerender(
    <UserActions
      user={banned} onToggleBan={jest.fn()} onDelete={jest.fn()}
    />,
  )
  fireEvent.click(screen.getByTestId('edit-user-2'))
  expect(screen.getByLabelText('Unban bob')).toBeInTheDocument()
})

it('confirm dialog wires buttons and default label', () => {
  const onConfirm = jest.fn()
  const onCancel = jest.fn()
  render(
    <ConfirmDialog
      open title="T" message="M"
      onConfirm={onConfirm} onCancel={onCancel}
    />,
  )
  expect(screen.getByTestId('confirm-submit-btn')).toHaveTextContent(
    'Delete')
  fireEvent.click(screen.getByTestId('confirm-submit-btn'))
  fireEvent.click(screen.getByTestId('confirm-cancel-btn'))
  expect(onConfirm).toHaveBeenCalled()
  expect(onCancel).toHaveBeenCalled()
})

it('confirm dialog accepts a custom label', () => {
  render(
    <ConfirmDialog
      open title="T" message="M" confirmLabel="Yes"
      onConfirm={jest.fn()} onCancel={jest.fn()}
    />,
  )
  expect(screen.getByText('Yes')).toBeInTheDocument()
})
