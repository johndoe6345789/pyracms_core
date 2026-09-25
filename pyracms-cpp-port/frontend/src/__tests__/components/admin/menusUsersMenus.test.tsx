import { render, screen, fireEvent, within } from '@testing-library/react'
import CreateGroupDialog from '@/components/admin/menus/CreateGroupDialog'

jest.mock(
  '@/lib/api',
  () => jest.requireActual('../../helpers/apiMock').apiMock,
)

const box = (id: string, role = 'textbox') =>
  within(screen.getByTestId(id)).getByRole(role)

it('CreateGroupDialog wires handlers', () => {
  const e = {
    groupDialogOpen: true,
    newGroupName: 'g',
    setNewGroupName: jest.fn(),
    handleCreateGroup: jest.fn(),
    handleCloseGroupDialog: jest.fn(),
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
