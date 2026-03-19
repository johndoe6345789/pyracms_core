'use client'

import { useState, useCallback } from 'react'
import {
  Box, Paper, Typography, IconButton, TextField, Button, Divider, Collapse,
} from '@mui/material'
import {
  DragIndicatorOutlined, AddOutlined, DeleteOutlined, EditOutlined,
  ExpandMoreOutlined, ExpandLessOutlined, SaveOutlined, SubdirectoryArrowRightOutlined,
} from '@mui/icons-material'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

interface MenuItemData {
  id: string
  label: string
  url: string
  children: MenuItemData[]
}

const PLACEHOLDER_MENU: MenuItemData[] = [
  { id: '1', label: 'Home', url: '/', children: [] },
  { id: '2', label: 'Articles', url: '/articles', children: [
    { id: '2a', label: 'Tutorials', url: '/articles?tag=tutorial', children: [] },
    { id: '2b', label: 'News', url: '/articles?tag=news', children: [] },
  ] },
  { id: '3', label: 'Forum', url: '/forum', children: [] },
  { id: '4', label: 'Code Snippets', url: '/snippets', children: [] },
  { id: '5', label: 'About', url: '/about', children: [
    { id: '5a', label: 'Team', url: '/about/team', children: [] },
    { id: '5b', label: 'Contact', url: '/about/contact', children: [] },
  ] },
]

const ITEM_TYPE = 'MENU_ITEM'

interface DragItem {
  id: string
  index: number
  parentId: string | null
}

function DraggableMenuItem({ item, index, parentId, depth, onEdit, onDelete, onMove }: {
  item: MenuItemData
  index: number
  parentId: string | null
  depth: number
  onEdit: (id: string, label: string, url: string) => void
  onDelete: (id: string) => void
  onMove: (dragId: string, dropId: string) => void
}) {
  const [expanded, setExpanded] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editLabel, setEditLabel] = useState(item.label)
  const [editUrl, setEditUrl] = useState(item.url)

  const [{ isDragging }, drag, preview] = useDrag({
    type: ITEM_TYPE,
    item: { id: item.id, index, parentId } as DragItem,
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  })

  const [{ isOver }, drop] = useDrop({
    accept: ITEM_TYPE,
    drop: (dragItem: DragItem) => {
      if (dragItem.id !== item.id) onMove(dragItem.id, item.id)
    },
    collect: (monitor) => ({ isOver: monitor.isOver({ shallow: true }) }),
  })

  const handleSaveEdit = () => {
    onEdit(item.id, editLabel, editUrl)
    setEditing(false)
  }

  return (
    <Box ref={(node: HTMLElement | null) => { preview(drop(node)) }} sx={{ opacity: isDragging ? 0.4 : 1, ml: depth * 3 }}>
      <Paper
        variant="outlined"
        sx={{
          display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1, mb: 0.5,
          borderColor: isOver ? 'primary.main' : 'divider',
          bgcolor: isOver ? 'primary.main' + '08' : 'background.paper',
        }}
      >
        <Box ref={(node: HTMLElement | null) => { drag(node) }} sx={{ cursor: 'grab', display: 'flex' }}>
          <DragIndicatorOutlined sx={{ color: 'text.secondary' }} />
        </Box>
        {depth > 0 && <SubdirectoryArrowRightOutlined sx={{ fontSize: 16, color: 'text.secondary' }} />}

        {editing ? (
          <Box sx={{ display: 'flex', gap: 1, flex: 1, alignItems: 'center' }}>
            <TextField size="small" value={editLabel} onChange={(e) => setEditLabel(e.target.value)} label="Label" sx={{ flex: 1 }} />
            <TextField size="small" value={editUrl} onChange={(e) => setEditUrl(e.target.value)} label="URL" sx={{ flex: 1 }} />
            <Button size="small" variant="contained" onClick={handleSaveEdit}>Save</Button>
            <Button size="small" onClick={() => setEditing(false)}>Cancel</Button>
          </Box>
        ) : (
          <>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{item.label}</Typography>
              <Typography variant="caption" color="text.secondary">{item.url}</Typography>
            </Box>
            {item.children.length > 0 && (
              <IconButton size="small" onClick={() => setExpanded(!expanded)}>
                {expanded ? <ExpandLessOutlined fontSize="small" /> : <ExpandMoreOutlined fontSize="small" />}
              </IconButton>
            )}
            <IconButton size="small" onClick={() => setEditing(true)}><EditOutlined fontSize="small" /></IconButton>
            <IconButton size="small" color="error" onClick={() => onDelete(item.id)}><DeleteOutlined fontSize="small" /></IconButton>
          </>
        )}
      </Paper>

      {item.children.length > 0 && (
        <Collapse in={expanded}>
          {item.children.map((child, childIdx) => (
            <DraggableMenuItem
              key={child.id}
              item={child}
              index={childIdx}
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

export function DragDropMenuEditor() {
  const [menuItems, setMenuItems] = useState<MenuItemData[]>(PLACEHOLDER_MENU)
  const [newLabel, setNewLabel] = useState('')
  const [newUrl, setNewUrl] = useState('')

  const handleEdit = useCallback((id: string, label: string, url: string) => {
    const editRecursive = (items: MenuItemData[]): MenuItemData[] =>
      items.map((item) => item.id === id
        ? { ...item, label, url }
        : { ...item, children: editRecursive(item.children) })
    setMenuItems(editRecursive)
  }, [])

  const handleDelete = useCallback((id: string) => {
    const deleteRecursive = (items: MenuItemData[]): MenuItemData[] =>
      items.filter((item) => item.id !== id).map((item) => ({ ...item, children: deleteRecursive(item.children) }))
    setMenuItems(deleteRecursive)
  }, [])

  const handleMove = useCallback((dragId: string, dropId: string) => {
    // Simplified: just reorder at same level for now
    console.log('Move', dragId, 'to', dropId)
  }, [])

  const handleAdd = () => {
    if (!newLabel || !newUrl) return
    const newItem: MenuItemData = { id: `new-${Date.now()}`, label: newLabel, url: newUrl, children: [] }
    setMenuItems((prev) => [...prev, newItem])
    setNewLabel('')
    setNewUrl('')
  }

  const handleSave = () => { console.log('Saving menu order:', menuItems) }

  return (
    <DndProvider backend={HTML5Backend}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <TextField size="small" value={newLabel} onChange={(e) => setNewLabel(e.target.value)} label="Label" placeholder="Menu item label" />
          <TextField size="small" value={newUrl} onChange={(e) => setNewUrl(e.target.value)} label="URL" placeholder="/path" />
          <Button variant="outlined" startIcon={<AddOutlined />} onClick={handleAdd} disabled={!newLabel || !newUrl}>Add Item</Button>
        </Box>

        <Divider />

        <Box>
          {menuItems.map((item, idx) => (
            <DraggableMenuItem key={item.id} item={item} index={idx} parentId={null} depth={0} onEdit={handleEdit} onDelete={handleDelete} onMove={handleMove} />
          ))}
          {menuItems.length === 0 && (
            <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>No menu items. Add one above.</Typography>
          )}
        </Box>

        <Button variant="contained" startIcon={<SaveOutlined />} onClick={handleSave} sx={{ alignSelf: 'flex-start' }}>Save Menu Order</Button>
      </Box>
    </DndProvider>
  )
}
