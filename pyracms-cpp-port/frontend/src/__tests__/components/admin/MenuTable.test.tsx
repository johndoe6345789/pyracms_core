import { render, screen, fireEvent, within } from '@testing-library/react'
import MenuItemTable from '@/components/admin/MenuItemTable'
import MenuGroupSelect from '@/components/admin/MenuGroupSelect'

const item = {
  id: 7, name: 'Home', route: '/', position: 1, permissions: 'public',
}

function table(items = [item], editingId: number | null = null) {
  const p = {
    items, editingId, editRow: editingId ? item : null,
    onEditRowChange: jest.fn(), onStartEdit: jest.fn(),
    onSaveEdit: jest.fn(), onCancelEdit: jest.fn(), onDelete: jest.fn(),
  }
  render(<MenuItemTable {...p} />)
  return p
}

it('shows an empty state', () => {
  table([])
  expect(screen.getByText('No items. Add one above.')).toBeInTheDocument()
})

it('renders view rows with actions', () => {
  const p = table()
  expect(screen.getByText('Home')).toBeInTheDocument()
  fireEvent.click(screen.getByTestId('edit-row-btn'))
  expect(p.onStartEdit).toHaveBeenCalledWith(item)
  fireEvent.click(screen.getByTestId('delete-row-btn'))
  expect(p.onDelete).toHaveBeenCalledWith(7)
})

it('edit cells emit updater functions', () => {
  const p = table([item], 7)
  const box = (id: string) =>
    within(screen.getByTestId(id)).getByRole('textbox')
  fireEvent.change(box('name-input'), { target: { value: 'N' } })
  fireEvent.change(box('route-input'), { target: { value: '/n' } })
  const pos = within(screen.getByTestId('position-input'))
    .getByRole('spinbutton')
  fireEvent.change(pos, { target: { value: 'abc' } })
  expect(p.onEditRowChange).toHaveBeenCalledTimes(3)
  const apply = (i: number) => p.onEditRowChange.mock.calls[i][0]
  expect(apply(0)(item)).toEqual({ ...item, name: 'N' })
  expect(apply(1)(item).route).toBe('/n')
  expect(apply(2)(item).position).toBe(0)
  expect(apply(0)(null)).toBeNull()
  fireEvent.click(screen.getByTestId('save-edit-btn'))
  fireEvent.click(screen.getByTestId('cancel-edit-btn'))
  expect(p.onSaveEdit).toHaveBeenCalled()
  expect(p.onCancelEdit).toHaveBeenCalled()
})

it('permission select updates the row', () => {
  const p = table([item], 7)
  const sel = within(screen.getByTestId('perms-select'))
  fireEvent.mouseDown(sel.getByRole('combobox'))
  fireEvent.click(screen.getByRole('option', { name: 'admin' }))
  const fn = p.onEditRowChange.mock.calls[0][0]
  expect(fn(item).permissions).toBe('admin')
})

it('edit cells fall back to defaults with no row', () => {
  table([item], 7)
  expect(screen.getByTestId('name-input')).toBeInTheDocument()
})

it('group select lists groups and fires callbacks', () => {
  const onGroupChange = jest.fn()
  const onNewGroup = jest.fn()
  render(
    <MenuGroupSelect
      menuGroups={[{ id: 1, name: 'main', items: [] }]}
      selectedGroup="main"
      onGroupChange={onGroupChange}
      onNewGroup={onNewGroup}
    />,
  )
  fireEvent.click(screen.getByText('New Menu Group'))
  expect(onNewGroup).toHaveBeenCalled()
  fireEvent.mouseDown(screen.getByRole('combobox'))
  fireEvent.click(screen.getByRole('option', { name: 'main' }))
  expect(onGroupChange).not.toHaveBeenCalled()
})
