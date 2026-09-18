import {
  render, screen, fireEvent, waitFor, act,
} from '@testing-library/react'
import MenusPage from '@/app/site/[slug]/(admin)/admin/menus/page'
import UsersPage from '@/app/site/[slug]/(admin)/admin/users/page'
import api from '@/lib/api'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { post: jest.fn(), get: jest.fn() },
}))
jest.mock('next/navigation', () => ({
  useParams: () => ({ slug: 'demo' }),
}))
jest.mock('@/hooks/useTenantId', () => ({
  useTenantId: () => ({ tenantId: 1, loading: false }),
}))

const editor: Record<string, unknown> = {
  menuGroups: [{ name: 'main', items: [] }],
  selectedGroup: 'main', currentItems: [], newName: 'a',
  newRoute: '/a', newPosition: '1', newPermissions: 'public',
  editingId: null, editRow: null, groupDialogOpen: true,
  newGroupName: 'g',
}
;[
  'setNewName', 'setNewRoute', 'setNewPosition',
  'setNewPermissions', 'handleAddItem', 'handleGroupChange',
  'handleOpenGroupDialog', 'handleCloseGroupDialog',
  'handleCreateGroup', 'setNewGroupName', 'setEditRow',
  'handleStartEdit', 'handleSaveEdit', 'handleCancelEdit',
  'handleDelete',
].forEach((k) => {
  editor[k] = jest.fn()
})
jest.mock('@/hooks/useMenuEditor', () => ({
  useMenuEditor: () => editor,
}))
jest.mock('@/hooks/useAdminUsers', () => ({
  useAdminUsers: () => ({
    users: [], deleteDialogOpen: false, selectedUser: null,
    handleToggleBan: jest.fn(), handleDeleteClick: jest.fn(),
    handleDeleteConfirm: jest.fn(), handleDeleteCancel: jest.fn(),
  }),
}))

const input = (id: string) =>
  screen.getByTestId(id).querySelector('input')!
const type = (id: string, value: string) =>
  fireEvent.change(input(id), { target: { value } })

describe('menus page', () => {
  it('wires the add-item form', () => {
    render(<MenusPage />)
    type('menu-name-input', 'x')
    expect(editor.setNewName).toHaveBeenCalledWith('x')
    type('menu-route-input', '/x')
    expect(editor.setNewRoute).toHaveBeenCalledWith('/x')
    type('menu-position-input', '3')
    expect(editor.setNewPosition).toHaveBeenCalledWith('3')
    fireEvent.click(screen.getByTestId('add-menu-item-btn'))
    expect(editor.handleAddItem).toHaveBeenCalled()
  })

  it('group dialog actions', () => {
    render(<MenusPage />)
    type('group-name-input', 'z')
    expect(editor.setNewGroupName).toHaveBeenCalledWith('z')
    fireEvent.keyDown(input('group-name-input'), { key: 'Enter' })
    fireEvent.keyDown(input('group-name-input'), { key: 'a' })
    fireEvent.click(screen.getByTestId('submit-group-btn'))
    expect(editor.handleCreateGroup).toHaveBeenCalledTimes(2)
    fireEvent.click(screen.getByTestId('cancel-group-btn'))
    expect(editor.handleCloseGroupDialog).toHaveBeenCalled()
  })
})

describe('users page create flow', () => {
  beforeEach(() => jest.clearAllMocks())

  const fill = () => {
    fireEvent.click(screen.getByTestId('create-user-btn'))
    type('new-username-input', ' bob ')
    type('new-email-input', 'b@x.io')
    type('new-fullname-input', 'Bob')
    type('new-password-input', 'pw')
  }

  it('disables submit until required fields set', () => {
    render(<UsersPage />)
    fireEvent.click(screen.getByTestId('create-user-btn'))
    expect(screen.getByTestId('submit-create-btn')).toBeDisabled()
  })

  it('posts trimmed values then reloads', async () => {
    ;(api.post as jest.Mock).mockResolvedValue({})
    const reload = jest.fn()
    Object.defineProperty(window, 'location', {
      value: { reload },
      writable: true,
    })
    render(<UsersPage />)
    fill()
    await act(async () => {
      fireEvent.click(screen.getByTestId('submit-create-btn'))
    })
    expect(api.post).toHaveBeenCalledWith('/api/auth/register', {
      username: 'bob',
      email: 'b@x.io',
      password: 'pw',
      fullName: 'Bob',
    })
    await waitFor(() => expect(reload).toHaveBeenCalled())
  })

  it('shows server error, then generic error', async () => {
    ;(api.post as jest.Mock)
      .mockRejectedValueOnce({ response: { data: { error: 'dup' } } })
      .mockRejectedValueOnce({})
    render(<UsersPage />)
    fill()
    fireEvent.click(screen.getByTestId('submit-create-btn'))
    expect(await screen.findByText('dup')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('submit-create-btn'))
    expect(await screen.findByText('Failed to create user'))
      .toBeInTheDocument()
    fireEvent.click(screen.getByTestId('cancel-create-btn'))
  })
})
