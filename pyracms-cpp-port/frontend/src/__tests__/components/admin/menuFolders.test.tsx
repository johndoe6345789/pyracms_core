import { render, screen, fireEvent } from '@testing-library/react'
import MenuItemEditRoute from '@/components/admin/MenuItemEditRoute'
import MenuParentSelect from '@/components/admin/menus/MenuParentSelect'
import type { MenuItemRow } from '@/hooks/admin/menuData'

const folder: MenuItemRow = {
  id: 3,
  name: 'Trainz',
  route: '',
  position: 1,
  permissions: 'public',
  type: 'folder',
  parentId: 0,
}
const link = { ...folder, id: 4, name: 'A', route: '/a', type: 'route' }

it('offers folders to file a link under, and hides itself with none', () => {
  const onChange = jest.fn()
  const { container, rerender } = render(
    <MenuParentSelect
      folders={[folder]}
      value={3}
      onChange={onChange}
      testId="p"
    />,
  )
  fireEvent.mouseDown(screen.getByRole('combobox'))
  fireEvent.click(screen.getByRole('option', { name: 'Top level' }))
  expect(onChange).toHaveBeenCalledWith(0)
  rerender(
    <MenuParentSelect folders={[]} value={0} onChange={onChange} testId="p" />,
  )
  expect(container).toBeEmptyDOMElement()
})

it('shows just "Folder" when editing a folder, a route box for links', () => {
  const { rerender } = render(
    <table>
      <tbody>
        <tr>
          <MenuItemEditRoute
            editRow={folder}
            folders={[]}
            onChange={jest.fn()}
          />
        </tr>
      </tbody>
    </table>,
  )
  expect(screen.getByText('Folder')).toBeInTheDocument()
  rerender(
    <table>
      <tbody>
        <tr>
          <MenuItemEditRoute
            editRow={link}
            folders={[folder, link]}
            onChange={jest.fn()}
          />
        </tr>
      </tbody>
    </table>,
  )
  expect(screen.getByTestId('route-input')).toBeInTheDocument()
  expect(screen.getByTestId('parent-select')).toBeInTheDocument()
})
