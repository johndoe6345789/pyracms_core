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
const names = () => screen.getAllByRole('option').map((o) => o.textContent)
const top = makeUser({ id: 9, role: UserRole.SuperAdmin })

it('shows the current level and saves a changed one', () => {
  const onSave = open({ role: 1 })
  expect(select()).toHaveTextContent('Normal User')
  dropdown()
  fireEvent.click(screen.getByRole('option', { name: 'Moderator' }))
  fireEvent.click(screen.getByTestId('save-edit-user-btn'))
  expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ role: 2 }))
})

it('offers only levels below an Administrator own level', () => {
  open({ role: 1 })
  dropdown()
  expect(names()).toEqual(['Guest', 'Normal User', 'Moderator'])
})

it('offers Administrator to a Platform Owner but never Platform Owner', () => {
  open({ role: 1 }, top)
  dropdown()
  expect(names()).toEqual([
    'Guest',
    'Normal User',
    'Moderator',
    'Administrator',
  ])
})

it('shows the backend message when a request is still rejected', () => {
  renderWithStore(
    <EditUserDialog
      user={user}
      saving={false}
      error="Cannot remove the last administrator of this site"
      onClose={jest.fn()}
      onSave={jest.fn()}
    />,
    makeUser({ role: 3 }),
  )
  expect(screen.getByTestId('edit-user-error')).toHaveTextContent(
    'last administrator',
  )
})
