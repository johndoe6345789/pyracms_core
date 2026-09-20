import { screen, fireEvent, within } from '@testing-library/react'
import { renderWithStore, makeUser } from '../../helpers/renderWithStore'
import { user } from '../../helpers/adminUserFixture'
import { UserRole } from '@/types'
import type { UserRow } from '@/hooks/admin/userRow'
import EditUserDialog from '@/components/admin/users/EditUserDialog'

const open = (target: Partial<UserRow>, me = makeUser({ role: 3 })) => {
  const onSave = jest.fn()
  renderWithStore(
    <EditUserDialog
      user={{ ...user, ...target }}
      saving={false}
      error=""
      onClose={jest.fn()}
      onSave={onSave}
    />,
    me,
  )
  return onSave
}
const select = () => screen.getByTestId('edit-role-select')
const dropdown = () =>
  fireEvent.mouseDown(within(select()).getByRole('combobox'))
const top = makeUser({ id: 9, role: UserRole.SuperAdmin })

it('locks the level on your own account', () => {
  open({ id: 1, role: 3 }, makeUser({ id: 1, role: 3 }))
  const reason = screen.getByTestId('edit-role-reason')
  expect(reason).toHaveTextContent(/your own account/)
  const box = within(select()).getByRole('combobox')
  expect(box).toHaveAttribute('aria-disabled', 'true')
})

it('locks the level of an equal or higher account', () => {
  open({ role: 3 })
  expect(screen.getByTestId('edit-role-reason')).toHaveTextContent(
    /equal or higher/,
  )
})

it('locks the level of the site owner for an Administrator', () => {
  open({ role: 1, siteOwner: true })
  expect(screen.getByTestId('edit-role-reason')).toHaveTextContent(/site owner/)
})

it('keeps the last administrator at Administrator', () => {
  open({ role: 3, lastAdmin: true }, top)
  const reason = screen.getByTestId('edit-role-reason')
  expect(reason).toHaveTextContent(/last administrator/)
  dropdown()
  const mod = screen.getByRole('option', { name: 'Moderator' })
  expect(mod).toHaveAttribute('aria-disabled', 'true')
  const adm = screen.getByRole('option', { name: 'Administrator' })
  expect(adm).not.toHaveAttribute('aria-disabled')
})
