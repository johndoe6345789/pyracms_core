'use client'

import { useState, useCallback } from 'react'
import {
  Box, TextField, Button,
  Divider, Typography,
} from '@mui/material'
import {
  AddOutlined, SaveOutlined,
} from '@mui/icons-material'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { MenuItemData } from './menuItemTypes'
import DraggableMenuItem
  from './DraggableMenuItem'
import PLACEHOLDER_MENU
  from './placeholderMenu'

export function DragDropMenuEditor() {
  const [items, setItems] =
    useState<MenuItemData[]>(PLACEHOLDER_MENU)
  const [label, setLabel] = useState('')
  const [url, setUrl] = useState('')

  const handleEdit = useCallback(
    (id: string, l: string, u: string) => {
      const rec = (
        arr: MenuItemData[],
      ): MenuItemData[] =>
        arr.map((m) => m.id === id
          ? { ...m, label: l, url: u }
          : { ...m, children: rec(m.children) })
      setItems(rec)
    }, [])

  const handleDelete = useCallback(
    (id: string) => {
      const rec = (
        arr: MenuItemData[],
      ): MenuItemData[] =>
        arr.filter((m) => m.id !== id)
          .map((m) => ({
            ...m, children: rec(m.children),
          }))
      setItems(rec)
    }, [])

  const handleMove = useCallback(
    (dId: string, tId: string) => {
      console.log('Move', dId, 'to', tId)
    }, [])

  const handleAdd = () => {
    if (!label || !url) return
    setItems((p) => [...p, {
      id: `new-${Date.now()}`,
      label, url, children: [],
    }])
    setLabel('')
    setUrl('')
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <Box sx={{
        display: 'flex',
        flexDirection: 'column', gap: 2,
      }}>
        <Box sx={{
          display: 'flex',
          gap: 1, alignItems: 'center',
        }}>
          <TextField
            size="small" value={label}
            onChange={(e) =>
              setLabel(e.target.value)}
            label="Label"
            placeholder="Menu item label"
            data-testid="new-label-input"
          />
          <TextField
            size="small" value={url}
            onChange={(e) =>
              setUrl(e.target.value)}
            label="URL" placeholder="/path"
            data-testid="new-url-input"
          />
          <Button
            variant="outlined"
            startIcon={<AddOutlined />}
            onClick={handleAdd}
            disabled={!label || !url}
            data-testid="add-menu-item-btn"
          >
            Add Item
          </Button>
        </Box>
        <Divider />
        <Box>
          {items.map((m, i) => (
            <DraggableMenuItem
              key={m.id} item={m}
              index={i} parentId={null}
              depth={0}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onMove={handleMove}
            />
          ))}
          {items.length === 0 && (
            <Typography
              color="text.secondary"
              sx={{
                textAlign: 'center', py: 4,
              }}
            >
              No menu items. Add one above.
            </Typography>
          )}
        </Box>
        <Button
          variant="contained"
          startIcon={<SaveOutlined />}
          onClick={() =>
            console.log('Saving:', items)}
          sx={{ alignSelf: 'flex-start' }}
          data-testid="save-menu-order-btn"
        >
          Save Menu Order
        </Button>
      </Box>
    </DndProvider>
  )
}
