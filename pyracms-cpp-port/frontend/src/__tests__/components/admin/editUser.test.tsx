import { screen, fireEvent, within } from '@testing-library/react'
import { renderWithStore, makeUser } from '../../helpers/renderWithStore'
import { user } from '../../helpers/adminUserFixture'
import { UserRole } from '@/types'
import EditUserDialog from '@/components/admin/users/EditUserDialog'

const box = (id: string) => within(screen.getByTestId(id)).getByRole('textbox')

const setup = (over = {}) => {
  const p = { onClose: jest.fn(), onSave: jest.fn() }
  renderWithStore(
    <EditUserDialog user={user} saving={false} error="" {...p} {...over} />,
    makeUser({ role: UserRole.SiteAdmin }),
  )
  return p
}

it('prefills and saves trimmed profile fields', () => {
  const p = setup()
  expect(box('edit-fullname-input')).toHaveValue('Bob B')
  fireEvent.change(box('edit-fullname-input'), { target: { value: ' Rob ' } })
  fireEvent.change(box('edit-email-input'), { target: { value: ' r@x ' } })
  fireEvent.click(screen.getByTestId('save-edit-user-btn'))
  expect(p.onSave).toHaveBeenCalledWith({
    fullName: 'Rob',
    email: 'r@x',
    role: 1,
  })
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
    'Saving...',
  )
  expect(screen.getByTestId('edit-user-error')).toHaveTextContent('Forbidden')
})

it('stays closed without a user', () => {
  renderWithStore(
    <EditUserDialog
      user={null}
      saving={false}
      error=""
      onClose={jest.fn()}
      onSave={jest.fn()}
    />,
  )
  expect(screen.queryByTestId('edit-user-dialog')).toBeNull()
})
