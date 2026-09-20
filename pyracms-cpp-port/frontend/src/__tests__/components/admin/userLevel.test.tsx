import { render, screen } from '@testing-library/react'
import UserTable from '@/components/admin/UserTable'
import type { Actor } from '@/lib/userGuards'
import type { UserRow } from '@/hooks/admin/userRow'
import { mapUser } from '@/hooks/admin/userRow'
import { user } from '../../helpers/adminUserFixture'

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

it('shows a Level column with a text label for every level', () => {
  const names = ['Guest', 'Normal User', 'Moderator', 'Administrator']
  show([0, 1, 2, 3, 4].map((r) => row(r + 10, { role: r })))
  expect(screen.getByText('Level')).toBeInTheDocument()
  const labels = screen.getAllByTestId('user-level-chip')
  expect(labels.map((l) => l.textContent)).toEqual([...names, 'Platform Owner'])
})

it('badges the site owner only', () => {
  show([row(2, { siteOwner: true }), row(3)])
  expect(screen.getAllByTestId('user-owner-badge')).toHaveLength(1)
  expect(screen.getByTestId('user-row-2')).toHaveTextContent('Site owner')
})

it('maps siteOwner and lastAdmin from the API', () => {
  const u = mapUser({ id: 1, role: 3, siteOwner: true, lastAdmin: true })
  expect(u).toMatchObject({ role: 3, siteOwner: true, lastAdmin: true })
  expect(mapUser({ id: 2 })).toMatchObject({ siteOwner: false, role: 1 })
})
