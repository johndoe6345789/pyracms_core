import { render, screen, fireEvent, within } from '@testing-library/react'
import MenuItemTable from '@/components/admin/MenuItemTable'

const item = (id: number) => ({
  id,
  name: `n${id}`,
  route: `/r${id}`,
  position: id,
  permissions: 'admin',
})

const props = () => ({
  editingId: null as number | null,
  editRow: null as never,
  onEditRowChange: jest.fn(),
  onStartEdit: jest.fn(),
  onSaveEdit: jest.fn(),
  onCancelEdit: jest.fn(),
  onDelete: jest.fn(),
})

it('MenuItemTable empty and view rows', () => {
  const p = props()
  const { rerender } = render(<MenuItemTable items={[]} {...p} />)
  expect(screen.getByText(/No items/)).toBeInTheDocument()
  rerender(<MenuItemTable items={[item(1)]} {...p} />)
  fireEvent.click(screen.getByTestId('edit-row-btn'))
  expect(p.onStartEdit).toHaveBeenCalledWith(item(1))
  fireEvent.click(screen.getByTestId('delete-row-btn'))
  expect(p.onDelete).toHaveBeenCalledWith(1)
})

it('MenuItemTable edit row updates fields', () => {
  const p = props()
  render(
    <MenuItemTable
      items={[item(1)]}
      {...p}
      editingId={1}
      editRow={item(1) as never}
    />,
  )
  const input = (id: string, role = 'textbox') =>
    within(screen.getByTestId(id)).getByRole(role)
  fireEvent.change(input('name-input'), { target: { value: 'z' } })
  fireEvent.change(input('route-input', 'combobox'), {
    target: { value: '/z' },
  })
  fireEvent.change(
    within(screen.getByTestId('position-input')).getByRole('spinbutton'),
    { target: { value: 'abc' } },
  )
  const set = p.onEditRowChange.mock.calls
  expect(set).toHaveLength(3)
  expect(set[0][0](item(1))).toMatchObject({ name: 'z' })
  expect(set[0][0](null)).toBeNull()
  expect(set[2][0](item(1))).toMatchObject({ position: 0 })
  fireEvent.mouseDown(
    within(screen.getByTestId('perms-select')).getByRole('combobox'),
  )
  fireEvent.click(screen.getByRole('option', { name: 'public' }))
  expect(p.onEditRowChange).toHaveBeenCalledTimes(4)
  fireEvent.click(screen.getByTestId('save-edit-btn'))
  fireEvent.click(screen.getByTestId('cancel-edit-btn'))
  expect(p.onSaveEdit).toHaveBeenCalled()
  expect(p.onCancelEdit).toHaveBeenCalled()
})

it('MenuItemTable edit row without editRow uses defaults', () => {
  render(<MenuItemTable items={[item(1)]} {...props()} editingId={1} />)
  expect(
    within(screen.getByTestId('name-input')).getByRole('textbox'),
  ).toHaveValue('')
})
