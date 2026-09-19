import {
  render, screen, fireEvent, within, renderHook, act, waitFor,
} from '@testing-library/react'
import AddMenuItemCard from '@/components/admin/menus/AddMenuItemCard'
import CreateGroupDialog from '@/components/admin/menus/CreateGroupDialog'
import CreateUserDialog from '@/components/admin/users/CreateUserDialog'
import { useCreateUser } from '@/components/admin/users/useCreateUser'
import TemplatePreview from '@/components/admin/templates/TemplatePreview'
import TemplateToolbar from '@/components/admin/templates/TemplateToolbar'
import { m } from '../../helpers/scopeApi'

jest.mock('@/lib/api', () => require('../../helpers/apiMock').apiMock)

const box = (id: string, role = 'textbox') =>
  within(screen.getByTestId(id)).getByRole(role)

it('AddMenuItemCard edits fields and adds', () => {
  const e = {
    newName: 'n', newRoute: '/r', newPosition: '1', newPermissions: 'admin',
    setNewName: jest.fn(), setNewRoute: jest.fn(),
    setNewPosition: jest.fn(), setNewPermissions: jest.fn(),
    handleAddItem: jest.fn(),
  }
  render(<AddMenuItemCard editor={e as never} />)
  fireEvent.change(box('menu-name-input'), { target: { value: 'a' } })
  fireEvent.change(box('menu-route-input'), { target: { value: '/a' } })
  fireEvent.change(box('menu-position-input', 'spinbutton'),
    { target: { value: '3' } })
  fireEvent.mouseDown(box('menu-permissions-select', 'combobox'))
  fireEvent.click(screen.getByRole('option', { name: 'public' }))
  fireEvent.click(screen.getByTestId('add-menu-item-btn'))
  expect(e.setNewName).toHaveBeenCalledWith('a')
  expect(e.setNewRoute).toHaveBeenCalledWith('/a')
  expect(e.setNewPosition).toHaveBeenCalledWith('3')
  expect(e.setNewPermissions).toHaveBeenCalledWith('public')
  expect(e.handleAddItem).toHaveBeenCalled()
})

it('CreateGroupDialog wires handlers', () => {
  const e = {
    groupDialogOpen: true, newGroupName: 'g', setNewGroupName: jest.fn(),
    handleCreateGroup: jest.fn(), handleCloseGroupDialog: jest.fn(),
  }
  render(<CreateGroupDialog editor={e as never} />)
  const input = box('group-name-input')
  fireEvent.change(input, { target: { value: 'x' } })
  fireEvent.keyDown(input, { key: 'Enter' })
  fireEvent.keyDown(input, { key: 'a' })
  fireEvent.click(screen.getByTestId('submit-group-btn'))
  fireEvent.click(screen.getByTestId('cancel-group-btn'))
  expect(e.setNewGroupName).toHaveBeenCalledWith('x')
  expect(e.handleCreateGroup).toHaveBeenCalledTimes(2)
  expect(e.handleCloseGroupDialog).toHaveBeenCalled()
})

const userState = (over = {}) => ({
  open: true, setOpen: jest.fn(), username: 'u', setUsername: jest.fn(),
  email: 'e', setEmail: jest.fn(), fullName: 'f', setFullName: jest.fn(),
  password: 'p', setPassword: jest.fn(), error: '', creating: false,
  canSubmit: true, submit: jest.fn(), ...over,
})

it('CreateUserDialog wires inputs', () => {
  const s = userState({ error: 'bad' })
  render(<CreateUserDialog s={s as never} />)
  expect(screen.getByTestId('create-user-error')).toHaveTextContent('bad')
  fireEvent.change(box('new-username-input'), { target: { value: 'a' } })
  fireEvent.change(box('new-email-input'), { target: { value: 'b@c' } })
  fireEvent.change(box('new-fullname-input'), { target: { value: 'c' } })
  fireEvent.change(
    screen.getByTestId('new-password-input').querySelector('input')!,
    { target: { value: 'd' } })
  fireEvent.click(screen.getByTestId('submit-create-btn'))
  fireEvent.click(screen.getByTestId('cancel-create-btn'))
  expect(s.setUsername).toHaveBeenCalledWith('a')
  expect(s.submit).toHaveBeenCalled()
  expect(s.setOpen).toHaveBeenCalledWith(false)
})

it('CreateUserDialog shows creating label', () => {
  render(<CreateUserDialog s={userState({ creating: true }) as never} />)
  expect(screen.getByText('Creating...')).toBeInTheDocument()
})

describe('useCreateUser', () => {
  beforeEach(() => jest.resetAllMocks())

  it('validates, submits, resets', async () => {
    const onCreated = jest.fn()
    m.post.mockResolvedValue({})
    const { result } = renderHook(() => useCreateUser(onCreated))
    expect(result.current.canSubmit).toBe(false)
    act(() => result.current.submit())
    expect(m.post).not.toHaveBeenCalled()
    act(() => {
      result.current.setUsername(' u ')
      result.current.setEmail('e@x')
      result.current.setPassword('p')
      result.current.setFullName(' F ')
      result.current.setOpen(true)
    })
    act(() => result.current.submit())
    await waitFor(() => expect(onCreated).toHaveBeenCalled())
    expect(m.post.mock.calls[0][1]).toMatchObject(
      { username: 'u', fullName: 'F' })
    expect(result.current.username).toBe('')
  })

  it('reports api errors', async () => {
    m.post.mockRejectedValueOnce({ response: { data: { error: 'dup' } } })
    const { result } = renderHook(() => useCreateUser(jest.fn()))
    act(() => {
      result.current.setUsername('u')
      result.current.setEmail('e')
      result.current.setPassword('p')
    })
    act(() => result.current.submit())
    await waitFor(() => expect(result.current.error).toBe('dup'))
    m.post.mockRejectedValueOnce(new Error('x'))
    act(() => result.current.submit())
    await waitFor(() =>
      expect(result.current.error).toBe('Failed to create user'))
  })
})

it('TemplatePreview sanitizes html', () => {
  render(<TemplatePreview section="header"
    html={'<b>ok</b><script>alert(1)</script>'} />)
  const body = screen.getByTestId('template-preview-body')
  expect(body.innerHTML).toContain('<b>ok</b>')
  expect(body.innerHTML).not.toContain('script')
})

it('TemplateToolbar wires controls', () => {
  const p = { onSection: jest.fn(), onTogglePreview: jest.fn(),
    onReset: jest.fn(), onSave: jest.fn() }
  render(<TemplateToolbar section="header" showPreview {...p} />)
  fireEvent.mouseDown(screen.getByRole('combobox'))
  fireEvent.click(screen.getByRole('option', { name: 'Footer' }))
  fireEvent.click(screen.getByRole('button', { name: 'Preview' }))
  fireEvent.click(screen.getByRole('button', { name: 'Reset' }))
  fireEvent.click(screen.getByRole('button', { name: 'Save' }))
  expect(p.onSection).toHaveBeenCalledWith('footer')
  expect(p.onTogglePreview).toHaveBeenCalled()
  expect(p.onReset).toHaveBeenCalled()
  expect(p.onSave).toHaveBeenCalled()
})
