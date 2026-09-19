import { screen, fireEvent } from '@testing-library/react'
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

it('shows the API error and keeps the dialog open', async () => {
  m.put.mockRejectedValue({ response: { data: { error: 'Forbidden' } } })
  renderWithStore(<AdminUsersPage />, admin)
  fireEvent.click(await screen.findByTestId('edit-user-1'))
  fireEvent.click(screen.getByTestId('save-edit-user-btn'))
  await screen.findByText('Forbidden')
  fireEvent.click(screen.getByTestId('cancel-edit-user-btn'))
})

it('shows ban and delete errors from the API', async () => {
  m.put.mockRejectedValue({
    response: { data: { error: 'The site owner cannot be changed' } },
  })
  m.delete.mockRejectedValue({
    response: { data: { error: 'Cannot delete: in use' } },
  })
  renderWithStore(<AdminUsersPage />, admin)
  fireEvent.click(await screen.findByTestId('ban-user-1'))
  await screen.findByText('The site owner cannot be changed')
  fireEvent.click(screen.getByTestId('delete-user-1'))
  fireEvent.click(screen.getByTestId('confirm-submit-btn'))
  await screen.findByText('Cannot delete: in use')
  expect(screen.getByTestId('user-row-1')).toBeInTheDocument()
})
