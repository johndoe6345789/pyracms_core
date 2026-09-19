import { render, screen, fireEvent } from '@testing-library/react'
import UsersHeader from '@/components/admin/users/UsersHeader'
import UserTable from '@/components/admin/UserTable'
import { user } from '../../helpers/adminUserFixture'

it('UsersHeader triggers create', () => {
  const onCreate = jest.fn()
  render(<UsersHeader onCreate={onCreate} />)
  fireEvent.click(screen.getByTestId('create-user-btn'))
  expect(onCreate).toHaveBeenCalled()
})

it('UserTable forwards onEdit to the edit action', () => {
  const onEdit = jest.fn()
  render(
    <UserTable
      users={[user]}
      onToggleBan={jest.fn()}
      onDelete={jest.fn()}
      onEdit={onEdit}
    />,
  )
  fireEvent.click(screen.getByTestId('edit-user-3'))
  expect(onEdit).toHaveBeenCalledWith(user)
})
