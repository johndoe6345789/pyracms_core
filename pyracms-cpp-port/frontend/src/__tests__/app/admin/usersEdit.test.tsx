import {
  render, screen, fireEvent, waitFor, within,
} from '@testing-library/react'
import AdminUsersPage from '@/app/site/[slug]/(admin)/admin/users/page'
import { m } from '../../helpers/scopeApi'
import { routeGet } from '../../helpers/scopeMocks'

jest.mock('@/lib/api', () => require('../../helpers/apiMock').apiMock)

beforeEach(() => {
  jest.resetAllMocks()
  routeGet({ '/api/users': [
    { id: 1, username: 'bob', fullName: 'Bob', email: 'b@x' }] })
  m.put.mockResolvedValue({})
})

const box = (id: string) =>
  within(screen.getByTestId(id)).getByRole('textbox')

it('edits a user from the list', async () => {
  render(<AdminUsersPage />)
  fireEvent.click(await screen.findByTestId('edit-user-1'))
  expect(box('edit-fullname-input')).toHaveValue('Bob')
  fireEvent.change(box('edit-email-input'), { target: { value: 'z@x' } })
  fireEvent.click(screen.getByTestId('save-edit-user-btn'))
  await waitFor(() => expect(m.put).toHaveBeenCalledWith(
    '/api/users/1', { fullName: 'Bob', email: 'z@x' }))
  await waitFor(() => expect(screen.getByTestId('user-row-1'))
    .toHaveTextContent('z@x'))
})

it('shows the API error and keeps the dialog open', async () => {
  m.put.mockRejectedValue({ response: { data: { error: 'Forbidden' } } })
  render(<AdminUsersPage />)
  fireEvent.click(await screen.findByTestId('edit-user-1'))
  fireEvent.click(screen.getByTestId('save-edit-user-btn'))
  await screen.findByText('Forbidden')
  fireEvent.click(screen.getByTestId('cancel-edit-user-btn'))
})
