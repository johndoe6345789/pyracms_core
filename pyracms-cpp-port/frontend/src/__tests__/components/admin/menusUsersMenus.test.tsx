import { render, screen, fireEvent, within } from '@testing-library/react'
import AddMenuItemCard from '@/components/admin/menus/AddMenuItemCard'
import CreateGroupDialog from '@/components/admin/menus/CreateGroupDialog'

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
