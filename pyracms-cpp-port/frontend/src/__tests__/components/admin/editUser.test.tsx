import { render, screen, fireEvent, within } from '@testing-library/react'
import EditUserDialog from '@/components/admin/users/EditUserDialog'
import UsersHeader from '@/components/admin/users/UsersHeader'
import UserTable from '@/components/admin/UserTable'

const user = { id: 3, username: 'bob', fullName: 'Bob B', email: 'b@x',
  created: 'c', banned: false }

const box = (id: string) =>
  within(screen.getByTestId(id)).getByRole('textbox')

const setup = (over = {}) => {
  const p = { onClose: jest.fn(), onSave: jest.fn() }
  render(<EditUserDialog user={user} saving={false} error="" {...p}
    {...over} />)
  return p
}

it('prefills and saves trimmed profile fields', () => {
  const p = setup()
  expect(box('edit-fullname-input')).toHaveValue('Bob B')
  fireEvent.change(box('edit-fullname-input'), { target: { value: ' Rob ' } })
  fireEvent.change(box('edit-email-input'), { target: { value: ' r@x ' } })
  fireEvent.click(screen.getByTestId('save-edit-user-btn'))
  expect(p.onSave).toHaveBeenCalledWith({ fullName: 'Rob', email: 'r@x' })
  fireEvent.click(screen.getByTestId('cancel-edit-user-btn'))
  expect(p.onClose).toHaveBeenCalled()
})

it('blocks saving without an email or while saving', () => {
  setup()
  fireEvent.change(box('edit-email-input'), { target: { value: ' ' } })
  expect(screen.getByTestId('save-edit-user-btn')).toBeDisabled()
})

it('shows the saving label and errors', () => {
  setup({ saving: true, error: 'Forbidden' })
  expect(screen.getByTestId('save-edit-user-btn')).toHaveTextContent(
    'Saving...')
  expect(screen.getByTestId('edit-user-error')).toHaveTextContent('Forbidden')
})

it('stays closed without a user', () => {
  render(<EditUserDialog user={null} saving={false} error=""
    onClose={jest.fn()} onSave={jest.fn()} />)
  expect(screen.queryByTestId('edit-user-dialog')).toBeNull()
})

it('UsersHeader triggers create', () => {
  const onCreate = jest.fn()
  render(<UsersHeader onCreate={onCreate} />)
  fireEvent.click(screen.getByTestId('create-user-btn'))
  expect(onCreate).toHaveBeenCalled()
})

it('UserTable forwards onEdit to the edit action', () => {
  const onEdit = jest.fn()
  render(<UserTable users={[user]} onToggleBan={jest.fn()}
    onDelete={jest.fn()} onEdit={onEdit} />)
  fireEvent.click(screen.getByTestId('edit-user-3'))
  expect(onEdit).toHaveBeenCalledWith(user)
})
