import { screen, fireEvent, waitFor, within } from '@testing-library/react'
import AdminUsersPage from '@/app/site/[slug]/(admin)/admin/users/page'
import { m } from '../../helpers/scopeApi'
import { routeGet } from '../../helpers/scopeMocks'
import { renderWithStore, makeUser } from '../../helpers/renderWithStore'
import { UserRole } from '@/types'

jest.mock('@/lib/api', () => require('../../helpers/apiMock').apiMock)

const admin = makeUser({ id: 9, role: UserRole.SiteAdmin })

beforeEach(() => {
  jest.resetAllMocks()
  localStorage.clear()
  routeGet({
    '/api/users': [
      { id: 1, username: 'bob', fullName: 'Bob', email: 'b@x', role: 1 },
    ],
  })
  m.put.mockResolvedValue({})
  m.delete.mockResolvedValue({})
})

const openRoles = async () => {
  fireEvent.click(await screen.findByTestId('edit-user-1'))
  fireEvent.mouseDown(screen.getByRole('combobox'))
  return within(screen.getByRole('listbox'))
    .getAllByRole('option')
    .map((o) => o.textContent)
}

it('saves a changed role with the profile', async () => {
  renderWithStore(<AdminUsersPage />, admin)
  await openRoles()
  fireEvent.click(screen.getByRole('option', { name: 'Moderator' }))
  fireEvent.click(screen.getByTestId('save-edit-user-btn'))
  await waitFor(() =>
    expect(m.put).toHaveBeenCalledWith('/api/users/1', {
      fullName: 'Bob',
      email: 'b@x',
      role: 2,
    }),
  )
  await waitFor(() =>
    expect(screen.queryByTestId('edit-user-dialog')).toBeNull(),
  )
})
