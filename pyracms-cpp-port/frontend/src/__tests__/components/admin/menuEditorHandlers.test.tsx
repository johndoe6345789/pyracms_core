import { render, act } from '@testing-library/react'
import { renderHook } from '@testing-library/react'
import { DndProvider } from 'react-dnd'
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
