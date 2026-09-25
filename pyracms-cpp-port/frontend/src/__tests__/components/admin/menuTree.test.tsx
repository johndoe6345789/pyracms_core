import { render, screen, fireEvent } from '@testing-library/react'
import MenuTree from '@/components/admin/menus/MenuTree'
import MenuPreview from '@/components/admin/menus/MenuPreview'
import { SECTIONS } from '@/lib/menuTargets'
import { menuRow } from '../../helpers/menuRow'

const items = [
  menuRow({ id: 1, name: 'Home', route: '/', position: 1 }),
  menuRow({ id: 2, name: 'Trainz', type: 'folder', route: '', position: 2 }),
  menuRow({ id: 3, name: 'Inside', parentId: 2, permissions: 'admin' }),
]
const handlers = () => ({
  onMove: jest.fn(),
  onEdit: jest.fn(),
  onDelete: jest.fn(),
  onAddInside: jest.fn(),
  onAdd: jest.fn(),
})

it('shows folders with their links and the controls of each row', () => {
  const h = handlers()
  render(<MenuTree items={items} targets={SECTIONS} busy={false} {...h} />)
  expect(screen.getByText('Folder with 1 link')).toBeInTheDocument()
  expect(screen.getByTestId('menu-row-1')).toBeInTheDocument()
  expect(screen.getByText('Admins only')).toBeInTheDocument()
  expect(screen.getByTestId('up-1')).toBeDisabled() // first
  expect(screen.getByTestId('down-2')).toBeDisabled() // last at the top
  fireEvent.click(screen.getByTestId('down-1'))
  expect(h.onMove).toHaveBeenCalledWith(1, 1)
  fireEvent.click(screen.getByTestId('edit-3'))
  expect(h.onEdit).toHaveBeenCalledWith(items[2])
  fireEvent.click(screen.getByTestId('delete-1'))
  expect(h.onDelete).toHaveBeenCalledWith(items[0])
  fireEvent.click(screen.getByTestId('add-in-2'))
  expect(h.onAddInside).toHaveBeenCalledWith(items[1])
  expect(screen.queryByTestId('add-in-1')).toBeNull()
})

it('invites you to add the first entry, and locks moves while busy', () => {
  const h = handlers()
  const { rerender } = render(
    <MenuTree items={[]} targets={SECTIONS} busy={false} {...h} />,
  )
  fireEvent.click(screen.getByRole('button', { name: 'Add a link' }))
  expect(h.onAdd).toHaveBeenCalled()
  rerender(<MenuTree items={items} targets={SECTIONS} busy {...h} />)
  expect(screen.getByTestId('down-1')).toBeDisabled()
})

it('previews the bar and opens a folder as a dropdown', () => {
  render(<MenuPreview items={items} />)
  fireEvent.click(screen.getByRole('button', { name: /Trainz/ }))
  expect(screen.getByRole('menuitem', { name: 'Inside' })).toBeInTheDocument()
})

it('says so when a previewed folder is empty', () => {
  render(<MenuPreview items={[items[1] as (typeof items)[number]]} />)
  fireEvent.click(screen.getByRole('button', { name: /Trainz/ }))
  expect(screen.getByText('Empty folder')).toBeInTheDocument()
})
