'use client'

import { useState } from 'react'
import { Box, Paper, Collapse } from '@mui/material'
import {
  DragIndicatorOutlined,
  SubdirectoryArrowRightOutlined,
} from '@mui/icons-material'
import { useDrag, useDrop } from 'react-dnd'
import {
  DragItem, ITEM_TYPE, DraggableMenuItemProps,
} from './menuItemTypes'
import DraggableMenuEditFields
  from './DraggableMenuEditFields'
import DraggableMenuItemView
  from './DraggableMenuItemView'

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

  const [{ isDragging }, drag, preview] = useDrag(
    {
      type: ITEM_TYPE,
      item: {
        id: item.id, index, parentId,
      } as DragItem,
      collect: (m) => ({
        isDragging: m.isDragging(),
      }),
    },
  )

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

  const handleSave = () => {
    onEdit(item.id, editLabel, editUrl)
    setEditing(false)
  }

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
      <Paper variant="outlined" sx={{
        display: 'flex', alignItems: 'center',
        gap: 1, px: 2, py: 1, mb: 0.5,
        borderColor: isOver
          ? 'primary.main' : 'divider',
        bgcolor: isOver
          ? 'primary.main' + '08'
          : 'background.paper',
      }}>
        <Box
          ref={(n: HTMLElement | null) => {
            drag(n)
          }}
          sx={{ cursor: 'grab', display: 'flex' }}
        >
          <DragIndicatorOutlined
            sx={{ color: 'text.secondary' }}
          />
        </Box>
        {depth > 0 && (
          <SubdirectoryArrowRightOutlined sx={{
            fontSize: 16,
            color: 'text.secondary',
          }} />
        )}
        {editing ? (
          <DraggableMenuEditFields
            editLabel={editLabel}
            editUrl={editUrl}
            onLabelChange={setEditLabel}
            onUrlChange={setEditUrl}
            onSave={handleSave}
            onCancel={() => setEditing(false)}
          />
        ) : (
          <DraggableMenuItemView
            label={item.label}
            url={item.url}
            hasChildren={hasKids}
            expanded={expanded}
            onToggleExpand={() =>
              setExpanded(!expanded)}
            onEdit={() => setEditing(true)}
            onDelete={() => onDelete(item.id)}
          />
        )}
      </Paper>
      {hasKids && (
        <Collapse in={expanded}>
          {item.children.map((c, i) => (
            <DraggableMenuItem
              key={c.id} item={c} index={i}
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
