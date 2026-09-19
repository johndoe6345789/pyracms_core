import { screen, fireEvent, waitFor, within } from '@testing-library/react'
import AdminUsersPage from '@/app/site/[slug]/(admin)/admin/users/page'
import { m } from '../../helpers/scopeApi'
import { routeGet } from '../../helpers/scopeMocks'
import { renderWithStore, makeUser } from '../../helpers/renderWithStore'
import { UserRole } from '@/types'

jest.mock(
  '@/lib/api',
  () => jest.requireActual('../../helpers/apiMock').apiMock,
)

const admin = makeUser({ id: 9, role: UserRole.SiteAdmin })

const owner = makeUser({ id: 9, role: UserRole.SuperAdmin })

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

const box = (id: string) => within(screen.getByTestId(id)).getByRole('textbox')

const openRoles = async () => {
  fireEvent.click(await screen.findByTestId('edit-user-1'))
  fireEvent.mouseDown(screen.getByRole('combobox'))
  return within(screen.getByRole('listbox'))
    .getAllByRole('option')
    .map((o) => o.textContent)
}

it('edits name and email from the list', async () => {
  renderWithStore(<AdminUsersPage />, admin)
  fireEvent.click(await screen.findByTestId('edit-user-1'))
  expect(box('edit-fullname-input')).toHaveValue('Bob')
  fireEvent.change(box('edit-email-input'), { target: { value: 'z@x' } })
  fireEvent.click(screen.getByTestId('save-edit-user-btn'))
  await waitFor(() =>
    expect(m.put).toHaveBeenCalledWith('/api/users/1', {
      fullName: 'Bob',
      email: 'z@x',
    }),
  )
  await waitFor(() =>
    expect(screen.getByTestId('user-row-1')).toHaveTextContent('z@x'),
  )
})

it('offers an administrator only roles up to Moderator', async () => {
  renderWithStore(<AdminUsersPage />, admin)
  expect(await openRoles()).toEqual(['Guest', 'Normal User', 'Moderator'])
})

it('offers Administrator to the platform owner', async () => {
  renderWithStore(<AdminUsersPage />, owner)
  expect(await openRoles()).toEqual([
    'Guest',
    'Normal User',
    'Moderator',
    'Administrator',
  ])
})
