import { render, screen, fireEvent, within, act } from '@testing-library/react'
import { renderHook } from '@testing-library/react'
import { DndProvider } from 'react-dnd'
import { DragDropMenuEditor } from '@/components/admin/DragDropMenuEditor'
import DraggableMenuItem from '@/components/admin/DraggableMenuItem'
import useMenuHandlers from '@/components/admin/useMenuHandlers'
import { moveBefore } from '@/components/admin/menuTree'
import PLACEHOLDER from '@/components/admin/placeholderMenu'

jest.mock('react-dnd', () => {
  const specs: Record<string, any> = {}
  return {
    __specs: specs,
    DndProvider: ({ children }: { children: React.ReactNode }) => children,
    useDrag: (spec: any) => {
      specs.drag = spec
      return [spec.collect({ isDragging: () => true }), jest.fn(), jest.fn()]
    },
    useDrop: (spec: any) => {
      specs.drop = spec
      return [spec.collect({ isOver: () => true }), jest.fn()]
    },
  }
})
jest.mock('react-dnd-html5-backend', () => ({ HTML5Backend: {} }))

const box = (id: string) =>
  within(screen.getByTestId(id)).getByRole('textbox')

it('editor adds, edits and deletes items', () => {
  jest.spyOn(console, 'log').mockImplementation()
  render(<DragDropMenuEditor />)
  fireEvent.change(box('new-label-input'), { target: { value: 'Zed' } })
  fireEvent.change(box('new-url-input'), { target: { value: '/zed' } })
  fireEvent.click(screen.getByTestId('add-menu-item-btn'))
  expect(screen.getByText('Zed')).toBeInTheDocument()
  fireEvent.click(screen.getAllByTestId('edit-menu-item-btn')[0]!)
  fireEvent.change(box('edit-label-input'), { target: { value: 'Hm' } })
  fireEvent.change(box('edit-url-input'), { target: { value: '/hm' } })
  fireEvent.click(screen.getByTestId('save-edit-btn'))
  expect(screen.getByText('Hm')).toBeInTheDocument()
  fireEvent.click(screen.getAllByTestId('edit-menu-item-btn')[0]!)
  fireEvent.click(screen.getByTestId('cancel-edit-btn'))
  fireEvent.click(screen.getAllByTestId('toggle-expand-btn')[0]!)
  fireEvent.click(screen.getAllByTestId('toggle-expand-btn')[0]!)
  const before = screen.getAllByTestId('delete-menu-item-btn').length
  fireEvent.click(screen.getAllByTestId('delete-menu-item-btn')[0]!)
  expect(screen.getAllByTestId('delete-menu-item-btn').length)
    .toBeLessThan(before)
  fireEvent.click(screen.getByTestId('save-menu-order-btn'))
  expect(console.log).toHaveBeenCalled()
})

it('editor shows empty state', () => {
  render(<DragDropMenuEditor />)
  let n = screen.queryAllByTestId('delete-menu-item-btn').length
  while (n > 0) {
    fireEvent.click(screen.getAllByTestId('delete-menu-item-btn')[0]!)
    n = screen.queryAllByTestId('delete-menu-item-btn').length
  }
  expect(screen.getByText(/No menu items/)).toBeInTheDocument()
})

it('renders nested items', () => {
  const item = { id: 'p', label: 'P', url: '/p', children: [
    { id: 'c', label: 'C', url: '/c', children: [] }] }
  render(
    <DndProvider backend={{} as never}>
      <DraggableMenuItem item={item} index={0} parentId={null} depth={0}
        onEdit={jest.fn()} onDelete={jest.fn()} onMove={jest.fn()} />
    </DndProvider>)
  expect(screen.getByText('C')).toBeInTheDocument()
})

it('useMenuHandlers ignores empty add and moves', () => {
  const { result } = renderHook(() => useMenuHandlers())
  const n = result.current.items.length
  act(() => result.current.handleAdd())
  expect(result.current.items).toHaveLength(n)
  act(() => result.current.handleMove('2', '1'))
  expect(result.current.items[0]!.id).toBe('2')
  act(() => result.current.handleEdit('2a', 'L', '/l'))
  act(() => result.current.handleDelete('2b'))
})

it('moveBefore guards invalid moves', () => {
  expect(moveBefore(PLACEHOLDER, 'x', '1')).toBe(PLACEHOLDER)
  expect(moveBefore(PLACEHOLDER, '1', '1')).toBe(PLACEHOLDER)
  expect(moveBefore(PLACEHOLDER, '1', 'nope')).toBe(PLACEHOLDER)
  expect(moveBefore(PLACEHOLDER, '2', '2a')).toBe(PLACEHOLDER)
  const moved = moveBefore(PLACEHOLDER, '2b', '1')
  expect(moved[0]!.id).toBe('2b')
})

it('drop handler moves other items only', () => {
  const onMove = jest.fn()
  const item = { id: 'p', label: 'P', url: '/p', children: [] }
  render(
    <DndProvider backend={{} as never}>
      <DraggableMenuItem item={item} index={0} parentId={null} depth={1}
        onEdit={jest.fn()} onDelete={jest.fn()} onMove={onMove} />
    </DndProvider>)
  const { __specs } = jest.requireMock('react-dnd')
  __specs.drop.drop({ id: 'p' })
  __specs.drop.drop({ id: 'q' })
  expect(onMove).toHaveBeenCalledTimes(1)
  expect(onMove).toHaveBeenCalledWith('q', 'p')
  expect(__specs.drag.item).toMatchObject({ id: 'p', index: 0 })
})
