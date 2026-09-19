import { render, screen, fireEvent, within } from '@testing-library/react'
import SettingsTable from '@/components/admin/SettingsTable'
import UserTable from '@/components/admin/UserTable'

const settings = [{ id: 1, key: 'a', value: 'b' }, { id: 2, key: 'c',
  value: 'd' }]

const sp = () => ({
  editValue: 'ev', onEditValueChange: jest.fn(), onStartEdit: jest.fn(),
  onSaveEdit: jest.fn(), onCancelEdit: jest.fn(), onDelete: jest.fn(),
})

it('SettingsTable view actions', () => {
  const p = sp()
  render(<SettingsTable settings={settings} editingId={null} {...p} />)
  fireEvent.click(screen.getAllByTestId('edit-setting-btn')[1]!)
  expect(p.onStartEdit).toHaveBeenCalledWith(settings[1])
  fireEvent.click(screen.getAllByTestId('delete-setting-btn')[0]!)
  expect(p.onDelete).toHaveBeenCalledWith(1)
})

it('SettingsTable edit actions and keys', () => {
  const p = sp()
  render(<SettingsTable settings={settings} editingId={1} {...p} />)
  const input = within(screen.getByTestId('setting-value-input'))
    .getByRole('textbox')
  fireEvent.change(input, { target: { value: 'n' } })
  expect(p.onEditValueChange).toHaveBeenCalledWith('n')
  fireEvent.keyDown(input, { key: 'Enter' })
  fireEvent.keyDown(input, { key: 'Escape' })
  fireEvent.keyDown(input, { key: 'a' })
  expect(p.onSaveEdit).toHaveBeenCalledWith(1)
  expect(p.onCancelEdit).toHaveBeenCalledTimes(1)
  fireEvent.click(screen.getByTestId('save-setting-btn'))
  fireEvent.click(screen.getByTestId('cancel-setting-btn'))
  expect(p.onSaveEdit).toHaveBeenCalledTimes(2)
  expect(p.onCancelEdit).toHaveBeenCalledTimes(2)
})

const user = (id: number, banned: boolean) => ({
  id, username: `u${id}`, email: 'e', created: 'c', banned,
})

it('UserTable renders rows and actions', () => {
  const onToggleBan = jest.fn()
  const onDelete = jest.fn()
  const users = [user(1, false), user(2, true)]
  render(<UserTable users={users} onToggleBan={onToggleBan}
    onDelete={onDelete} />)
  expect(screen.getByTestId('user-row-1')).toHaveTextContent('Active')
  expect(screen.getByTestId('user-row-2')).toHaveTextContent('Banned')
  fireEvent.click(screen.getByTestId('ban-user-2'))
  fireEvent.click(screen.getByTestId('delete-user-1'))
  fireEvent.click(screen.getByTestId('edit-user-1'))
  expect(onToggleBan).toHaveBeenCalledWith(2)
  expect(onDelete).toHaveBeenCalledWith(users[0])
})
