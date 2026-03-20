'use client'

import { useState } from 'react'
import { Box, Collapse } from '@mui/material'
import { useDrag, useDrop } from 'react-dnd'
import {
  DragItem, ITEM_TYPE,
  DraggableMenuItemProps,
} from './menuItemTypes'
import DraggableMenuItemPaper
  from './DraggableMenuItemPaper'

export { type MenuItemData } from './menuItemTypes'

export default function DraggableMenuItem({
  item, index, parentId, depth,
  onEdit, onDelete, onMove,
}: DraggableMenuItemProps) {
  const [expanded, setExpanded] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editLabel, setEditLabel] =
    useState(item.label)
  const [editUrl, setEditUrl] =
    useState(item.url)

  const [{ isDragging }, drag, preview] =
    useDrag({
      type: ITEM_TYPE,
      item: {
        id: item.id, index, parentId,
      } as DragItem,
      collect: (m) => ({
        isDragging: m.isDragging(),
      }),
    })

  const [{ isOver }, drop] = useDrop({
    accept: ITEM_TYPE,
    drop: (d: DragItem) => {
      if (d.id !== item.id)
        onMove(d.id, item.id)
    },
    collect: (m) => ({
      isOver: m.isOver({ shallow: true }),
    }),
  })

  const hasKids = item.children.length > 0

  return (
    <Box
      ref={(n: HTMLElement | null) => {
        preview(drop(n))
      }}
      sx={{
        opacity: isDragging ? 0.4 : 1,
        ml: depth * 3,
      }}
    >
      <DraggableMenuItemPaper
        depth={depth} isOver={isOver}
        dragRef={(n) => { drag(n) }}
        editing={editing}
        editLabel={editLabel}
        editUrl={editUrl}
        onLabelChange={setEditLabel}
        onUrlChange={setEditUrl}
        onSave={() => {
          onEdit(item.id, editLabel, editUrl)
          setEditing(false)
        }}
        onCancelEdit={() => setEditing(false)}
        label={item.label} url={item.url}
        hasKids={hasKids}
        expanded={expanded}
        onToggleExpand={() =>
          setExpanded(!expanded)}
        onEdit={() => setEditing(true)}
        onDelete={() => onDelete(item.id)}
      />
      {hasKids && (
        <Collapse in={expanded}>
          {item.children.map((c, i) => (
            <DraggableMenuItem
              key={c.id} item={c}
              index={i}
              parentId={item.id}
              depth={depth + 1}
              onEdit={onEdit}
              onDelete={onDelete}
              onMove={onMove}
            />
          ))}
        </Collapse>
      )}
    </Box>
  )
}
