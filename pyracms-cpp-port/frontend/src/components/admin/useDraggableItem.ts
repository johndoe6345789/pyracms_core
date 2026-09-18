'use client'

import { useDrag, useDrop } from 'react-dnd'
import { DragItem, ITEM_TYPE } from './menuItemTypes'

/**
 * Wires react-dnd drag and drop for a menu item.
 * @param id - The item id.
 * @param index - The item index in its parent.
 * @param parentId - The parent item id or null.
 * @param onMove - Called with (dragId, targetId) on drop.
 * @returns Drag state and refs to attach.
 */
export function useDraggableItem(
  id: string,
  index: number,
  parentId: string | null,
  onMove: (dragId: string, targetId: string) => void,
) {
  const [{ isDragging }, drag, preview] = useDrag({
    type: ITEM_TYPE,
    item: { id, index, parentId } as DragItem,
    collect: (m) => ({ isDragging: m.isDragging() }),
  })
  const [{ isOver }, drop] = useDrop({
    accept: ITEM_TYPE,
    drop: (d: DragItem) => {
      if (d.id !== id) onMove(d.id, id)
    },
    collect: (m) => ({
      isOver: m.isOver({ shallow: true }),
    }),
  })
  return { isDragging, isOver, drag, drop, preview }
}
