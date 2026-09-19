import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from '@testing-library/react'
import AdminFilesPage from '@/app/site/[slug]/(admin)/admin/files/page'
import AdminMenusPage from '@/app/site/[slug]/(admin)/admin/menus/page'
import AdminUsersPage from '@/app/site/[slug]/(admin)/admin/users/page'
import AdminBackupPage from '@/app/site/[slug]/(admin)/admin/backup/page'
import { m } from '../../helpers/scopeApi'
import { routeGet } from '../../helpers/scopeMocks'
import { renderWithStore } from '../../helpers/renderWithStore'

jest.mock('@/lib/api', () => require('../../helpers/apiMock').apiMock)
jest.mock('next/navigation', () => require('../../helpers/scopeMocks').navMock)
jest.mock(
  '@/hooks/useTenantId',
  () => require('../../helpers/scopeMocks').tenantMock,
)

beforeEach(() => {
  jest.resetAllMocks()
  m.put.mockResolvedValue({})
  m.delete.mockResolvedValue({})
  m.post.mockResolvedValue({ data: { id: 9, filename: 'up.txt' } })
})

it('files page lists, uploads and deletes', async () => {
  routeGet({ '/api/files': [{ id: 1, filename: 'a.txt', uuid: 'u' }] })
  render(<AdminFilesPage />)
  await screen.findByTestId('file-card-1')
  fireEvent.change(screen.getByTestId('upload-file-input'), {
    target: { files: [new File(['x'], 'up.txt')] },
  })
  await screen.findByTestId('file-card-9')
  fireEvent.click(screen.getByTestId('delete-file-1'))
  fireEvent.click(screen.getByTestId('confirm-submit-btn'))
  await waitFor(() => expect(screen.queryByTestId('file-card-1')).toBeNull())
})

it('menus page renders groups and adds an item', async () => {
  routeGet({ '/items': [], '/api/menu-groups': [{ id: 1, name: 'main' }] })
  render(<AdminMenusPage />)
  await screen.findByText('main')
  const box = (id: string) =>
    within(screen.getByTestId(id)).getByRole('textbox')
  fireEvent.change(box('menu-name-input'), { target: { value: 'N' } })
  fireEvent.change(box('menu-route-input'), { target: { value: '/n' } })
  fireEvent.click(screen.getByTestId('add-menu-item-btn'))
  await screen.findByText('/n')
  fireEvent.click(screen.getByRole('button', { name: /New Menu Group/ }))
  expect(screen.getByTestId('create-group-dialog')).toBeInTheDocument()
})

it('users page bans, deletes and opens create dialog', async () => {
  routeGet({ '/api/users': [{ id: 1, username: 'bob', banned: false }] })
  renderWithStore(<AdminUsersPage />)
  await screen.findByTestId('user-row-1')
  fireEvent.click(screen.getByTestId('ban-user-1'))
  await screen.findByText('Banned')
  fireEvent.click(screen.getByTestId('delete-user-1'))
  expect(screen.getByText(/user "bob"/)).toBeInTheDocument()
  fireEvent.click(screen.getByTestId('confirm-submit-btn'))
  await waitFor(() => expect(screen.queryByTestId('user-row-1')).toBeNull())
  fireEvent.click(screen.getByTestId('create-user-btn'))
  expect(screen.getByTestId('create-user-dialog')).toBeInTheDocument()
})

it('backup page exports and imports', async () => {
  URL.createObjectURL = jest.fn(() => 'blob:x')
  URL.revokeObjectURL = jest.fn()
  jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation()
  routeGet({ '/api/menu-groups': [] })
  render(<AdminBackupPage />)
  fireEvent.click(screen.getByRole('button', { name: 'Export Menus' }))
  await screen.findByText(/Menus exported/)
  fireEvent.click(screen.getByRole('button', { name: /Choose File/ }))
})
