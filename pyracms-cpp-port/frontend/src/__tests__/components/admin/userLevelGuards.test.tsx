import { render, screen, fireEvent } from '@testing-library/react'
import UserTable from '@/components/admin/UserTable'
import type { Actor } from '@/lib/userGuards'
import type { UserRow } from '@/hooks/admin/userRow'
import { user } from '../../helpers/adminUserFixture'

const admin: Actor = { id: 1, role: 3 }
const top: Actor = { id: 9, role: 4 }
const row = (id: number, over: Partial<UserRow> = {}): UserRow => ({
  ...user,
  id,
  username: `u${id}`,
  ...over,
})

const show = (users: UserRow[], actor?: Actor) => {
  const p = { onToggleBan: jest.fn(), onDelete: jest.fn() }
  render(<UserTable users={users} actor={actor} {...p} />)
  return p
}

it('disables ban and delete on your own row with a reason', () => {
  const p = show([row(1)], admin)
  expect(screen.getByTestId('ban-user-1')).toBeDisabled()
  expect(screen.getByTestId('delete-user-1')).toBeDisabled()
  expect(screen.getAllByLabelText(/your own account/)).toHaveLength(2)
  fireEvent.click(screen.getByTestId('delete-user-1'))
  expect(p.onDelete).not.toHaveBeenCalled()
})

it('disables actions on equal or higher levels', () => {
  show([row(2, { role: 3 }), row(3, { role: 4 })], admin)
  for (const id of [2, 3]) {
    expect(screen.getByTestId(`ban-user-${id}`)).toBeDisabled()
    expect(screen.getByTestId(`delete-user-${id}`)).toBeDisabled()
  }
  expect(screen.getAllByLabelText(/equal or higher/)).toHaveLength(4)
})

it('disables actions on the site owner unless Platform Owner', () => {
  show([row(2, { siteOwner: true })], admin)
  expect(screen.getByTestId('delete-user-2')).toBeDisabled()
  expect(screen.getAllByLabelText(/site owner cannot/)).toHaveLength(2)
})

it('lets a Platform Owner act on the site owner', () => {
  show([row(2, { siteOwner: true, role: 3 })], top)
  expect(screen.getByTestId('delete-user-2')).toBeEnabled()
  expect(screen.getByTestId('ban-user-2')).toBeEnabled()
})

it('disables ban and delete on the last administrator', () => {
  show([row(2, { role: 3, lastAdmin: true })], top)
  expect(screen.getByTestId('ban-user-2')).toBeDisabled()
  expect(screen.getByTestId('delete-user-2')).toBeDisabled()
  expect(screen.getAllByLabelText(/last administrator/)).toHaveLength(2)
})

it('keeps actions enabled for a lower level', () => {
  const p = show([row(2)], admin)
  fireEvent.click(screen.getByTestId('ban-user-2'))
  expect(p.onToggleBan).toHaveBeenCalledWith(2)
  expect(screen.getByTestId('edit-user-2')).toBeEnabled()
})
